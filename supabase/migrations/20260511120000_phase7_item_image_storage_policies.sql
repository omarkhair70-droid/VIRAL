create policy item_images_storage_insert_own
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'item-images'
  and name like 'items/' || auth.uid()::text || '/%'
);

create policy item_images_storage_update_own
on storage.objects
for update
to authenticated
using (
  bucket_id = 'item-images'
  and name like 'items/' || auth.uid()::text || '/%'
)
with check (
  bucket_id = 'item-images'
  and name like 'items/' || auth.uid()::text || '/%'
);

create policy item_images_storage_delete_own
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'item-images'
  and name like 'items/' || auth.uid()::text || '/%'
);
