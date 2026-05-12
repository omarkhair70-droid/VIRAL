create table if not exists public.featured_story_items (
  item_id uuid primary key references public.items(id) on delete cascade,
  sort_order integer not null default 0,
  curator_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint featured_story_items_curator_note_len check (curator_note is null or char_length(curator_note) <= 240)
);
create index if not exists featured_story_items_sort_idx on public.featured_story_items(sort_order asc, created_at desc);

drop trigger if exists featured_story_items_updated on public.featured_story_items;
create trigger featured_story_items_updated before update on public.featured_story_items
for each row execute function public.set_updated_at();

create table if not exists public.creator_drops (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  drop_type text not null,
  creator_name text,
  intro_copy text not null,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint creator_drops_slug_len check (char_length(slug) <= 80),
  constraint creator_drops_title_len check (char_length(title) <= 120),
  constraint creator_drops_creator_name_len check (creator_name is null or char_length(creator_name) <= 100),
  constraint creator_drops_intro_len check (char_length(intro_copy) <= 500),
  constraint creator_drops_status_check check (status in ('draft','published')),
  constraint creator_drops_type_check check (drop_type in ('artist_drop','creator_closet','event_piece','story_item','limited_swap'))
);
create index if not exists creator_drops_status_created_idx on public.creator_drops(status, created_at desc);

drop trigger if exists creator_drops_updated on public.creator_drops;
create trigger creator_drops_updated before update on public.creator_drops
for each row execute function public.set_updated_at();

create table if not exists public.creator_drop_items (
  drop_id uuid not null references public.creator_drops(id) on delete cascade,
  item_id uuid not null references public.items(id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (drop_id, item_id)
);
create index if not exists creator_drop_items_drop_sort_idx on public.creator_drop_items(drop_id, sort_order asc, created_at desc);
create index if not exists creator_drop_items_item_idx on public.creator_drop_items(item_id);

alter table public.featured_story_items enable row level security;
alter table public.creator_drops enable row level security;
alter table public.creator_drop_items enable row level security;

create policy featured_story_items_public_select on public.featured_story_items
for select using (
  exists (select 1 from public.items i where i.id = featured_story_items.item_id and i.status in ('active','reserved','swapped'))
);
create policy featured_story_items_admin_all on public.featured_story_items
for all to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

create policy creator_drops_public_select on public.creator_drops
for select using (status = 'published');
create policy creator_drops_admin_all on public.creator_drops
for all to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

create policy creator_drop_items_public_select on public.creator_drop_items
for select using (
  exists (select 1 from public.creator_drops d where d.id = creator_drop_items.drop_id and d.status = 'published')
  and exists (select 1 from public.items i where i.id = creator_drop_items.item_id and i.status in ('active','reserved','swapped'))
);
create policy creator_drop_items_admin_all on public.creator_drop_items
for all to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
