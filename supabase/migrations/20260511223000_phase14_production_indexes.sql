create index if not exists idx_items_owner_created on public.items (owner_id, created_at desc);
create index if not exists idx_items_status_created on public.items (status, created_at desc);
create index if not exists idx_items_category on public.items (category_id);
create index if not exists idx_items_city on public.items (city);
create index if not exists idx_items_status_category_created on public.items (status, category_id, created_at desc);
create index if not exists idx_items_status_city_created on public.items (status, city, created_at desc);

create index if not exists idx_item_images_item on public.item_images (item_id);
create index if not exists idx_item_images_item_primary on public.item_images (item_id, is_primary);

create index if not exists idx_item_wanted_tags_item on public.item_wanted_tags (item_id);

create index if not exists idx_offers_sender_created on public.offers (sender_id, created_at desc);
create index if not exists idx_offers_receiver_created on public.offers (receiver_id, created_at desc);
create index if not exists idx_offers_status_created on public.offers (status, created_at desc);
create index if not exists idx_offers_requested_item on public.offers (requested_item_id);
create index if not exists idx_offers_offered_item on public.offers (offered_item_id);

create index if not exists idx_offer_events_offer_created on public.offer_events (offer_id, created_at desc);

create index if not exists idx_deals_requester_created on public.swap_deals (requester_id, created_at desc);
create index if not exists idx_deals_offerer_created on public.swap_deals (offerer_id, created_at desc);
create index if not exists idx_deals_status_created on public.swap_deals (status, created_at desc);
create index if not exists idx_deals_offer on public.swap_deals (offer_id);

create index if not exists idx_deal_confirmations_deal on public.deal_confirmations (deal_id);
create index if not exists idx_deal_confirmations_user on public.deal_confirmations (user_id);

create index if not exists idx_reviews_reviewee_created on public.reviews (reviewee_id, created_at desc);
create index if not exists idx_reviews_reviewer_created on public.reviews (reviewer_id, created_at desc);
create index if not exists idx_reviews_deal on public.reviews (deal_id);

create index if not exists idx_reports_reporter_created on public.reports (reporter_id, created_at desc);
create index if not exists idx_reports_status_created on public.reports (status, created_at desc);
create index if not exists idx_reports_reported_user on public.reports (reported_user_id);
create index if not exists idx_reports_item on public.reports (item_id);
create index if not exists idx_reports_offer on public.reports (offer_id);
create index if not exists idx_reports_deal on public.reports (deal_id);

create index if not exists idx_notifications_user_read_created on public.notifications (user_id, read_at, created_at desc);
create index if not exists idx_notifications_user_created on public.notifications (user_id, created_at desc);
