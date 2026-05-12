alter table public.reviews
  add column if not exists clear_description boolean not null default false,
  add column if not exists good_communication boolean not null default false,
  add column if not exists on_time boolean not null default false,
  add column if not exists respectful_swapper boolean not null default false;
