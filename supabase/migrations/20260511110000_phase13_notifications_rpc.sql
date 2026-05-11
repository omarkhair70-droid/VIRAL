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
  new_id uuid;
begin
  insert into public.notifications (
    user_id,
    type,
    title,
    body,
    item_id,
    offer_id,
    deal_id
  )
  values (
    target_user_id,
    notification_type,
    notification_title,
    notification_body,
    target_item_id,
    target_offer_id,
    target_deal_id
  )
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

create index if not exists notifications_user_read_created_idx
on public.notifications (user_id, read_at, created_at desc);
