create table public.account_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  email text not null,
  username text,
  request_note text,
  request_source text not null check (request_source in ('public_web','authenticated_profile')),
  status text not null default 'pending' check (status in ('pending','reviewing','resolved','declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger account_deletion_requests_updated
before update on public.account_deletion_requests
for each row execute function public.set_updated_at();

alter table public.account_deletion_requests enable row level security;

create policy account_deletion_requests_public_insert
on public.account_deletion_requests
for insert
to anon
with check (request_source = 'public_web' and user_id is null);

create policy account_deletion_requests_authenticated_insert
on public.account_deletion_requests
for insert
to authenticated
with check (
  (request_source = 'public_web' and user_id is null)
  or
  (request_source = 'authenticated_profile' and user_id = auth.uid())
);
