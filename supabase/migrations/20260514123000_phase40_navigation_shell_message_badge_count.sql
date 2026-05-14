create or replace function public.get_unread_deal_messages_count()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid;
  unread_count integer;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    return 0;
  end if;

  select count(*)::integer
  into unread_count
  from public.deal_messages dm
  join public.swap_deals sd on sd.id = dm.deal_id
  left join public.deal_message_reads dmr
    on dmr.deal_id = dm.deal_id
   and dmr.user_id = current_user_id
  where (sd.requester_id = current_user_id or sd.offerer_id = current_user_id)
    and dm.sender_id <> current_user_id
    and (dmr.last_read_at is null or dm.created_at > dmr.last_read_at);

  return coalesce(unread_count, 0);
end;
$$;

revoke all on function public.get_unread_deal_messages_count() from public;
revoke all on function public.get_unread_deal_messages_count() from anon;
revoke all on function public.get_unread_deal_messages_count() from authenticated;
grant execute on function public.get_unread_deal_messages_count() to authenticated;
