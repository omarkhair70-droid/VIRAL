create table if not exists public.deal_message_reads (
  deal_id uuid not null references public.swap_deals(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  last_read_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (deal_id, user_id)
);

create trigger deal_message_reads_updated
before update on public.deal_message_reads
for each row
execute function public.set_updated_at();

alter table public.deal_message_reads enable row level security;

create policy deal_message_reads_self_select
on public.deal_message_reads
for select to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1 from public.swap_deals d
    where d.id = deal_id and (d.requester_id = auth.uid() or d.offerer_id = auth.uid())
  )
);

create policy deal_message_reads_self_insert
on public.deal_message_reads
for insert to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.swap_deals d
    where d.id = deal_id and (d.requester_id = auth.uid() or d.offerer_id = auth.uid())
  )
);

create policy deal_message_reads_self_update
on public.deal_message_reads
for update to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1 from public.swap_deals d
    where d.id = deal_id and (d.requester_id = auth.uid() or d.offerer_id = auth.uid())
  )
)
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.swap_deals d
    where d.id = deal_id and (d.requester_id = auth.uid() or d.offerer_id = auth.uid())
  )
);

create or replace function public.mark_deal_thread_read(p_deal_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_deal_exists boolean;
  v_is_participant boolean;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  select exists(select 1 from public.swap_deals d where d.id = p_deal_id) into v_deal_exists;
  if not v_deal_exists then
    raise exception 'Deal not found';
  end if;

  select exists(
    select 1 from public.swap_deals d
    where d.id = p_deal_id and (d.requester_id = v_user_id or d.offerer_id = v_user_id)
  ) into v_is_participant;

  if not v_is_participant then
    raise exception 'Not allowed';
  end if;

  insert into public.deal_message_reads (deal_id, user_id, last_read_at)
  values (p_deal_id, v_user_id, now())
  on conflict (deal_id, user_id)
  do update set last_read_at = excluded.last_read_at, updated_at = now();
end;
$$;

revoke all on function public.mark_deal_thread_read(uuid) from public;
grant execute on function public.mark_deal_thread_read(uuid) to authenticated;

alter table public.deal_messages
  add constraint deal_messages_body_not_blank check (char_length(btrim(body)) > 0),
  add constraint deal_messages_body_max_length check (char_length(body) <= 800);
