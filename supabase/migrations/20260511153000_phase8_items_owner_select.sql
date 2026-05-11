create policy items_owner_select
on public.items
for select
to authenticated
using (owner_id = auth.uid());
