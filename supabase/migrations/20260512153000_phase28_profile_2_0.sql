alter table public.profiles
  add column if not exists cover_url text,
  add column if not exists interests text,
  add column if not exists swap_preferences text,
  add column if not exists preferred_categories text,
  add column if not exists profile_tagline text;

alter table public.profiles
  drop constraint if exists profiles_cover_url_length,
  add constraint profiles_cover_url_length check (cover_url is null or char_length(cover_url) <= 500),
  drop constraint if exists profiles_interests_length,
  add constraint profiles_interests_length check (interests is null or char_length(interests) <= 180),
  drop constraint if exists profiles_swap_preferences_length,
  add constraint profiles_swap_preferences_length check (swap_preferences is null or char_length(swap_preferences) <= 240),
  drop constraint if exists profiles_preferred_categories_length,
  add constraint profiles_preferred_categories_length check (preferred_categories is null or char_length(preferred_categories) <= 180),
  drop constraint if exists profiles_profile_tagline_length,
  add constraint profiles_profile_tagline_length check (profile_tagline is null or char_length(profile_tagline) <= 120);

insert into storage.buckets (id, name, public)
values ('profile-images', 'profile-images', true)
on conflict (id) do update set public = excluded.public;

create policy profile_images_storage_insert_own
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'profile-images'
  and (
    name like 'profiles/' || auth.uid()::text || '/avatar/%'
    or name like 'profiles/' || auth.uid()::text || '/cover/%'
  )
);

create policy profile_images_storage_update_own
on storage.objects
for update
to authenticated
using (
  bucket_id = 'profile-images'
  and (
    name like 'profiles/' || auth.uid()::text || '/avatar/%'
    or name like 'profiles/' || auth.uid()::text || '/cover/%'
  )
)
with check (
  bucket_id = 'profile-images'
  and (
    name like 'profiles/' || auth.uid()::text || '/avatar/%'
    or name like 'profiles/' || auth.uid()::text || '/cover/%'
  )
);

create policy profile_images_storage_delete_own
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'profile-images'
  and (
    name like 'profiles/' || auth.uid()::text || '/avatar/%'
    or name like 'profiles/' || auth.uid()::text || '/cover/%'
  )
);
