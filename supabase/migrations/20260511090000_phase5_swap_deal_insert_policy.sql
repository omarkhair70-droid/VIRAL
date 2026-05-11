create policy deals_receiver_insert_after_accept
on public.swap_deals
for insert
to authenticated
with check (
  auth.uid() = requester_id
  and exists (
    select 1
    from public.offers o
    where o.id = offer_id
      and o.receiver_id = auth.uid()
      and o.sender_id = offerer_id
      and o.requested_item_id = requested_item_id
      and o.offered_item_id = offered_item_id
      and o.status = 'accepted'
  )
);
