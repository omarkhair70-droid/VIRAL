-- Hotfix Pack 1: security/RLS hardening for notifications, profiles, items, and offer events.

-- 1) Harden generic notification RPC so authenticated users cannot forge arbitrary notifications.
revoke execute on function public.create_notification(
  uuid,
  public.notification_type,
  text,
  text,
  uuid,
  uuid,
  uuid
) from public, anon;

create or replace function public.create_notification(
  target_user_id uuid,
  notification_type public.notification_type,
  notification_title text,
  notification_body text default null,
  target_item_id uuid default null,
  target_offer_id uuid default null,
  target_deal_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_offer public.offers%rowtype;
  v_deal public.swap_deals%rowtype;
  new_id uuid;
begin
  if v_actor is null then
    raise exception 'Authentication required';
  end if;

  if target_user_id is null then
    raise exception 'target_user_id is required';
  end if;

  if notification_type not in (
    'offer_received','offer_thinking','offer_accepted','offer_soft_rejected','offer_redirected',
    'deal_created','deal_completed','deal_cancelled','report_update','system'
  ) then
    raise exception 'Unsupported notification type';
  end if;

  if notification_type in ('offer_received','offer_thinking','offer_accepted','offer_soft_rejected','offer_redirected','deal_created') then
    if target_offer_id is null then
      raise exception 'offer notifications require target_offer_id';
    end if;

    select * into v_offer from public.offers where id = target_offer_id;
    if not found then raise exception 'Offer not found'; end if;

    if notification_type = 'offer_received' then
      if v_actor <> v_offer.sender_id then raise exception 'Only sender can notify offer_received'; end if;
      if target_user_id <> v_offer.receiver_id then raise exception 'offer_received target mismatch'; end if;
    elsif notification_type in ('offer_thinking','offer_accepted','offer_soft_rejected','offer_redirected') then
      if v_actor <> v_offer.receiver_id then raise exception 'Only receiver can notify offer response'; end if;
      if target_user_id <> v_offer.sender_id then raise exception 'Offer response target mismatch'; end if;
    elsif notification_type = 'deal_created' then
      if v_actor <> v_offer.receiver_id then raise exception 'Only receiver can notify deal_created'; end if;
      if target_user_id not in (v_offer.sender_id, v_offer.receiver_id) then raise exception 'deal_created target must be participant'; end if;
      if target_deal_id is null then raise exception 'deal_created requires target_deal_id'; end if;
    end if;
  elsif notification_type in ('deal_completed','deal_cancelled','system') then
    if target_deal_id is null then
      raise exception 'deal/system notifications require target_deal_id';
    end if;

    select * into v_deal from public.swap_deals where id = target_deal_id;
    if not found then raise exception 'Deal not found'; end if;

    if v_actor not in (v_deal.requester_id, v_deal.offerer_id) then
      raise exception 'Only deal participants can notify for this deal';
    end if;

    if target_user_id not in (v_deal.requester_id, v_deal.offerer_id) then
      raise exception 'Deal notification target must be participant';
    end if;
  elsif notification_type = 'report_update' then
    if not exists (select 1 from public.admin_users a where a.user_id = v_actor) then
      raise exception 'Only admins can send report_update notifications';
    end if;
  end if;

  insert into public.notifications (user_id, type, title, body, item_id, offer_id, deal_id)
  values (target_user_id, notification_type, notification_title, notification_body, target_item_id, target_offer_id, target_deal_id)
  returning id into new_id;

  return new_id;
end;
$$;

grant execute on function public.create_notification(
  uuid,
  public.notification_type,
  text,
  text,
  uuid,
  uuid,
  uuid
) to authenticated;

-- 2) Restrict self profile updates to editable fields only; block trust/admin/system fields.
create or replace function public.guard_profiles_self_update()
returns trigger
language plpgsql
as $$
begin
  if current_setting('app.trusted_profile_metric_update', true) = 'on' then
    return new;
  end if;

  if auth.uid() is not null and auth.uid() = old.id then
    if new.successful_swaps_count is distinct from old.successful_swaps_count
      or new.response_rate is distinct from old.response_rate
      or new.is_banned is distinct from old.is_banned
      or new.created_at is distinct from old.created_at
      or new.id is distinct from old.id then
      raise exception 'Protected profile fields cannot be changed by the profile owner';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_self_update_guard on public.profiles;
create trigger profiles_self_update_guard
before update on public.profiles
for each row execute function public.guard_profiles_self_update();

-- 3) Restrict item-owner updates from mutating lifecycle/system fields directly.
create or replace function public.guard_items_owner_update()
returns trigger
language plpgsql
as $$
declare
  v_actor uuid := auth.uid();
  v_is_owner boolean := (v_actor is not null and old.owner_id = v_actor);
begin
  if current_setting('app.trusted_item_lifecycle_update', true) = 'on' then
    return new;
  end if;

  if v_is_owner then
    if new.owner_id is distinct from old.owner_id
      or new.created_at is distinct from old.created_at
      or new.source is distinct from old.source
      or new.created_from_offer_id is distinct from old.created_from_offer_id
      or new.view_count is distinct from old.view_count
      or new.offer_count is distinct from old.offer_count then
      raise exception 'Owner cannot mutate protected item system fields';
    end if;

    if new.status is distinct from old.status and new.status <> 'archived' then
      raise exception 'Owner can only set item status to archived directly';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists items_owner_update_guard on public.items;
create trigger items_owner_update_guard
before update on public.items
for each row execute function public.guard_items_owner_update();

-- 4) Prevent offer event spoofing by enforcing actor identity and strict allowed user-side event combinations.
drop policy if exists offer_events_participant_insert on public.offer_events;

create policy offer_events_participant_insert
on public.offer_events
for insert
to authenticated
with check (
  actor_id = auth.uid()
  and exists (
    select 1 from public.offers o
    where o.id = offer_id and (o.sender_id = auth.uid() or o.receiver_id = auth.uid())
  )
  and (
    (event_type = 'created' and old_status is null and new_status = 'pending')
    or (event_type = 'marked_thinking' and old_status in ('pending','thinking') and new_status = 'thinking')
    or (event_type = 'soft_rejected' and old_status in ('pending','thinking') and new_status = 'soft_rejected')
    or (event_type = 'redirected' and old_status in ('pending','thinking') and new_status = 'redirected')
    or (event_type = 'withdrawn' and old_status in ('pending','thinking') and new_status = 'withdrawn')
  )
);


-- 5) Preserve trusted lifecycle/system RPC flows by using scoped trigger bypass flags inside DB-owned workflows.
create or replace function public.increment_successful_swaps_for_users(user_a uuid, user_b uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform set_config('app.trusted_profile_metric_update', 'on', true);

  update public.profiles
  set successful_swaps_count = successful_swaps_count + 1
  where id in (user_a, user_b);
end;
$$;

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

  perform set_config('app.trusted_item_lifecycle_update', 'on', true);

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

  perform set_config('app.trusted_item_lifecycle_update', 'on', true);

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
