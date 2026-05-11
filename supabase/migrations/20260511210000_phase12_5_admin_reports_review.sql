create table if not exists public.admin_users (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'admin_users' and policyname = 'admin_users_self_select'
  ) then
    create policy admin_users_self_select
    on public.admin_users
    for select
    to authenticated
    using (user_id = auth.uid());
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'reports' and policyname = 'reports_admin_select'
  ) then
    create policy reports_admin_select
    on public.reports
    for select
    to authenticated
    using (
      exists (
        select 1 from public.admin_users a
        where a.user_id = auth.uid()
      )
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'reports' and policyname = 'reports_admin_update'
  ) then
    create policy reports_admin_update
    on public.reports
    for update
    to authenticated
    using (
      exists (
        select 1 from public.admin_users a
        where a.user_id = auth.uid()
      )
    )
    with check (
      exists (
        select 1 from public.admin_users a
        where a.user_id = auth.uid()
      )
    );
  end if;
end $$;
