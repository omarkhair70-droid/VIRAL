create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  feedback_type text not null,
  status text not null default 'new',
  subject text not null,
  details text,
  page_path text,
  admin_note text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint feedback_type_check check (feedback_type in ('bug','idea','confusion','praise','other')),
  constraint feedback_status_check check (status in ('new','reviewed','planned','dismissed')),
  constraint feedback_subject_len check (char_length(subject) <= 120),
  constraint feedback_details_len check (details is null or char_length(details) <= 1000),
  constraint feedback_page_path_len check (page_path is null or char_length(page_path) <= 300),
  constraint feedback_admin_note_len check (admin_note is null or char_length(admin_note) <= 1000)
);

create index if not exists feedback_user_created_idx on public.feedback (user_id, created_at desc);
create index if not exists feedback_status_created_idx on public.feedback (status, created_at desc);
create index if not exists feedback_type_created_idx on public.feedback (feedback_type, created_at desc);

create trigger feedback_updated
before update on public.feedback
for each row
execute function public.set_updated_at();

alter table public.feedback enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='feedback' and policyname='feedback_self_insert'
  ) then
    create policy feedback_self_insert
    on public.feedback
    for insert
    to authenticated
    with check (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='feedback' and policyname='feedback_self_select'
  ) then
    create policy feedback_self_select
    on public.feedback
    for select
    to authenticated
    using (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='feedback' and policyname='feedback_admin_select'
  ) then
    create policy feedback_admin_select
    on public.feedback
    for select
    to authenticated
    using (
      exists (
        select 1 from public.admin_users a where a.user_id = auth.uid()
      )
    );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='feedback' and policyname='feedback_admin_update'
  ) then
    create policy feedback_admin_update
    on public.feedback
    for update
    to authenticated
    using (
      exists (
        select 1 from public.admin_users a where a.user_id = auth.uid()
      )
    )
    with check (
      exists (
        select 1 from public.admin_users a where a.user_id = auth.uid()
      )
    );
  end if;
end $$;
