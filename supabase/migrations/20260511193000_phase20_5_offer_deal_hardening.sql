-- Phase 20.5: offers/deals lifecycle hardening + atomic accept/deal completion guards

-- 1) Replace broad participant update policies.
drop policy if exists offers_participant_update on public.offers;
drop policy if exists deals_participant_update on public.swap_deals;

create policy offers_participant_lifecycle_update
on public.offers
for update
to authenticated
using (sender_id = auth.uid() or receiver_id = auth.uid())
with check (sender_id = auth.uid() or receiver_id = auth.uid());

create policy deals_participant_lifecycle_update
on public.swap_deals
for update
to authenticated
using (requester_id = auth.uid() or offerer_id = auth.uid())
with check (requester_id = auth.uid() or offerer_id = auth.uid());


-- 1.5) Offer insert DB integrity protection.
create or replace function public.enforce_offer_insert_integrity()
returns trigger
language plpgsql
as $$
declare
  v_requested_item public.items%rowtype;
  v_offered_item public.items%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if new.sender_id <> auth.uid() then
    raise exception 'sender_id must equal auth.uid()';
  end if;

  if new.sender_id = new.receiver_id then
    raise exception 'sender and receiver must be different users';
  end if;

  if new.requested_item_id = new.offered_item_id then
    raise exception 'requested_item_id and offered_item_id must differ';
  end if;

  select * into v_requested_item from public.items where id = new.requested_item_id;
  if not found then raise exception 'Requested item not found'; end if;
  if v_requested_item.status <> 'active' then raise exception 'Requested item must be active'; end if;
  if v_requested_item.owner_id <> new.receiver_id then raise exception 'Requested item owner must match receiver'; end if;

  select * into v_offered_item from public.items where id = new.offered_item_id;
  if not found then raise exception 'Offered item not found'; end if;
  if v_offered_item.status <> 'active' then raise exception 'Offered item must be active'; end if;
  if v_offered_item.owner_id <> new.sender_id then raise exception 'Offered item owner must match sender'; end if;

  return new;
end;
$$;

drop trigger if exists offers_insert_guard on public.offers;
create trigger offers_insert_guard
before insert on public.offers
for each row execute function public.enforce_offer_insert_integrity();

-- 2) Offer lifecycle DB protection.
create or replace function public.enforce_offer_lifecycle()
returns trigger
language plpgsql
as $$
begin
  if new.requested_item_id is distinct from old.requested_item_id
    or new.offered_item_id is distinct from old.offered_item_id
    or new.sender_id is distinct from old.sender_id
    or new.receiver_id is distinct from old.receiver_id
    or new.parent_offer_id is distinct from old.parent_offer_id then
    raise exception 'Offer identity fields are immutable';
  end if;

  if new.status = old.status then
    if new.message is distinct from old.message
      or new.public_note is distinct from old.public_note
      or new.redirect_type is distinct from old.redirect_type
      or new.responded_at is distinct from old.responded_at then
      raise exception 'Arbitrary same-status offer field mutation is not allowed';
    end if;
    return new;
  end if;

  if old.status in ('soft_rejected','redirected','withdrawn','expired','cancelled_after_accept') then
    raise exception 'Offer is in terminal status';
  end if;

  if old.status = 'accepted' then
    if new.status = 'cancelled_after_accept' and auth.uid() in (old.sender_id, old.receiver_id) then
      return new;
    end if;
    raise exception 'Accepted offers can only move to cancelled_after_accept';
  end if;

  if old.status = 'pending' and new.status = 'thinking' then
    if auth.uid() <> old.receiver_id then raise exception 'Only receiver can mark thinking'; end if;
    return new;
  end if;

  if old.status in ('pending','thinking') and new.status in ('accepted','soft_rejected','redirected') then
    if auth.uid() <> old.receiver_id then raise exception 'Only receiver can respond'; end if;
    return new;
  end if;

  if old.status in ('pending','thinking') and new.status = 'withdrawn' then
    if auth.uid() <> old.sender_id then raise exception 'Only sender can withdraw'; end if;
    return new;
  end if;

  raise exception 'Invalid offer status transition % -> %', old.status, new.status;
end;
$$;

drop trigger if exists offers_lifecycle_guard on public.offers;
create trigger offers_lifecycle_guard
before update on public.offers
for each row execute function public.enforce_offer_lifecycle();

-- 3) Swap deal lifecycle DB protection.
create or replace function public.enforce_swap_deal_lifecycle()
returns trigger
language plpgsql
as $$
declare
  confirmations_count integer;
begin
  if new.offer_id is distinct from old.offer_id
    or new.requested_item_id is distinct from old.requested_item_id
    or new.offered_item_id is distinct from old.offered_item_id
    or new.requester_id is distinct from old.requester_id
    or new.offerer_id is distinct from old.offerer_id then
    raise exception 'Deal identity fields are immutable';
  end if;

  if old.status = 'completed' and new.status <> 'completed' then
    raise exception 'Completed deals are terminal';
  end if;

  if new.status = 'completed' and old.status <> 'completed' then
    select count(*) into confirmations_count from public.deal_confirmations where deal_id = old.id;
    if confirmations_count < 2 then
      raise exception 'Cannot complete deal without both confirmations';
    end if;
    if new.completed_at is null then
      new.completed_at := now();
    end if;
  elsif new.status <> 'completed' then
    new.completed_at := null;
  end if;

  if new.status = old.status then
    if new.completed_at is distinct from old.completed_at
      or new.cancelled_at is distinct from old.cancelled_at
      or new.public_story is distinct from old.public_story then
      raise exception 'Arbitrary same-status deal field mutation is not allowed';
    end if;
    return new;
  end if;

  if old.status = 'coordinating' and new.status in ('completed_pending_confirmation','completed','cancelled','disputed') then
    return new;
  end if;

  if old.status = 'completed_pending_confirmation' and new.status in ('completed','cancelled','disputed') then
    return new;
  end if;

  raise exception 'Invalid deal status transition % -> %', old.status, new.status;
end;
$$;

drop trigger if exists swap_deals_lifecycle_guard on public.swap_deals;
create trigger swap_deals_lifecycle_guard
before update on public.swap_deals
for each row execute function public.enforce_swap_deal_lifecycle();

-- 4) Atomic accept offer RPC: accept + reserve items + create deal/event.
create or replace function public.accept_offer(p_offer_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_offer public.offers%rowtype;
  v_requested_item public.items%rowtype;
  v_offered_item public.items%rowtype;
  v_deal_id uuid;
  v_reserved_count integer;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  select * into v_offer from public.offers where id = p_offer_id for update;
  if not found then raise exception 'Offer not found'; end if;

  if v_offer.receiver_id <> v_user_id then
    raise exception 'Only receiver can accept offer';
  end if;

  if v_offer.status not in ('pending','thinking') then
    raise exception 'Offer not respondable';
  end if;

  if v_offer.sender_id = v_user_id then
    raise exception 'Sender cannot accept own offer';
  end if;

  select * into v_requested_item from public.items where id = v_offer.requested_item_id for update;
  if not found then raise exception 'Requested item not found'; end if;

  select * into v_offered_item from public.items where id = v_offer.offered_item_id for update;
  if not found then raise exception 'Offered item not found'; end if;

  if v_requested_item.status <> 'active' then
    raise exception 'Requested item not active';
  end if;

  if v_offered_item.status <> 'active' then
    raise exception 'Offered item not active';
  end if;

  if v_requested_item.owner_id <> v_offer.receiver_id then
    raise exception 'Requested item owner mismatch';
  end if;

  if v_offered_item.owner_id <> v_offer.sender_id then
    raise exception 'Offered item owner mismatch';
  end if;

  update public.offers
  set status = 'accepted', responded_at = now()
  where id = p_offer_id;

  update public.items
  set status = 'reserved'
  where id in (v_offer.requested_item_id, v_offer.offered_item_id)
    and status = 'active';

  get diagnostics v_reserved_count = row_count;
  if v_reserved_count <> 2 then
    raise exception 'Failed to reserve both items atomically';
  end if;

  insert into public.swap_deals (offer_id, requested_item_id, offered_item_id, requester_id, offerer_id, status)
  values (v_offer.id, v_offer.requested_item_id, v_offer.offered_item_id, v_offer.receiver_id, v_offer.sender_id, 'coordinating')
  on conflict (offer_id) do update set offer_id = excluded.offer_id
  returning id into v_deal_id;

  insert into public.offer_events (offer_id, actor_id, event_type, old_status, new_status)
  values (v_offer.id, v_user_id, 'accepted', v_offer.status, 'accepted');

  return v_deal_id;
end;
$$;

grant execute on function public.accept_offer(uuid) to authenticated;

create or replace function public.complete_deal_if_ready(p_deal_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_deal public.swap_deals%rowtype;
  v_confirmations integer;
begin
  if v_user_id is null then raise exception 'Authentication required'; end if;

  select * into v_deal from public.swap_deals where id = p_deal_id for update;
  if not found then raise exception 'Deal not found'; end if;

  if v_user_id not in (v_deal.requester_id, v_deal.offerer_id) then
    raise exception 'Not a participant';
  end if;

  if v_deal.status not in ('coordinating','completed_pending_confirmation') then
    return false;
  end if;

  select count(*) into v_confirmations from public.deal_confirmations where deal_id = p_deal_id;

  if v_confirmations < 2 then
    update public.swap_deals
    set status = 'completed_pending_confirmation'
    where id = p_deal_id and status = 'coordinating';
    return false;
  end if;

  update public.swap_deals
  set status = 'completed', completed_at = now()
  where id = p_deal_id and status in ('coordinating','completed_pending_confirmation');

  update public.items
  set status = 'swapped'
  where id in (v_deal.requested_item_id, v_deal.offered_item_id)
    and status in ('reserved','active');

  insert into public.offer_events (offer_id, actor_id, event_type, old_status, new_status)
  values (v_deal.offer_id, v_user_id, 'completed', 'accepted', 'accepted');

  perform public.increment_successful_swaps_for_users(v_deal.requester_id, v_deal.offerer_id);
  return true;
end;
$$;

grant execute on function public.complete_deal_if_ready(uuid) to authenticated;
