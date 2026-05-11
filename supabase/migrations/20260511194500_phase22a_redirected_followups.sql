-- Phase 22A: redirected follow-up offer integrity

create or replace function public.enforce_offer_insert_integrity()
returns trigger
language plpgsql
as $$
declare
  v_requested_item public.items%rowtype;
  v_offered_item public.items%rowtype;
  v_parent_offer public.offers%rowtype;
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

  if new.parent_offer_id is not null then
    select * into v_parent_offer from public.offers where id = new.parent_offer_id;
    if not found then raise exception 'Parent offer not found'; end if;
    if v_parent_offer.status <> 'redirected' then raise exception 'Parent offer must be redirected'; end if;
    if new.status <> 'pending' then raise exception 'Follow-up offer must start pending'; end if;
    if new.sender_id <> v_parent_offer.sender_id then raise exception 'Follow-up sender mismatch'; end if;
    if new.receiver_id <> v_parent_offer.receiver_id then raise exception 'Follow-up receiver mismatch'; end if;
    if new.requested_item_id <> v_parent_offer.requested_item_id then raise exception 'Follow-up requested item mismatch'; end if;
    if new.offered_item_id = v_parent_offer.offered_item_id then raise exception 'Follow-up offered item must differ'; end if;
  end if;

  return new;
end;
$$;

create unique index if not exists offers_unique_active_followup
on public.offers (parent_offer_id, offered_item_id)
where parent_offer_id is not null
and status = any (array['pending'::offer_status, 'thinking'::offer_status, 'accepted'::offer_status]);
