alter table public.reports
add column if not exists deal_message_id uuid references public.deal_messages(id) on delete set null;

create index if not exists reports_deal_message_id_idx
on public.reports (deal_message_id);

create index if not exists deal_messages_deal_sender_created_idx
on public.deal_messages (deal_id, sender_id, created_at desc);

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'deal_messages'
      and policyname = 'deal_messages_admin_select'
  ) then
    create policy deal_messages_admin_select
      on public.deal_messages
      for select
      to authenticated
      using (
        exists (
          select 1
          from public.admin_users a
          where a.user_id = auth.uid()
        )
      );
  end if;
end
$$;
