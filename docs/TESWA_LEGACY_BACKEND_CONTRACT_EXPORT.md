# 1. Executive Summary
This VIRAL repo contains a substantial Supabase backend definition under `supabase/migrations` plus concrete app/server usage across item publishing, offers, deals, messaging, notifications, feedback, account deletion, and admin curation.

Based on migration chronology and breadth, this repo appears to be the **legacy schema/policy source-of-truth candidate** for Teswa web/PWA, but not guaranteed to be a perfect mirror of the current live project (possible drift).

Reconstructibility from repo is high for core entities (`profiles`, `items`, `offers`, `swap_deals`, `deal_messages`, `notifications`, `reports`, `reviews`) and medium for operational details that may drift (storage buckets, any manual dashboard edits, runtime grants, possibly replaced functions).

For Teswa Mobile, reusing this backend avoids duplicate business state, duplicate moderation/trust logic, and split offer/deal/messaging timelines.

# 2. Backend Source Inventory
## Migrations (primary backend contract)
- `supabase/migrations/20260511031000_phase0_foundation.sql`
- `supabase/migrations/20260511090000_phase5_swap_deal_insert_policy.sql`
- `supabase/migrations/20260511110000_phase13_notifications_rpc.sql`
- `supabase/migrations/20260511120000_phase7_item_image_storage_policies.sql`
- `supabase/migrations/20260511153000_phase8_items_owner_select.sql`
- `supabase/migrations/20260511190000_phase10_deal_completion_reviews.sql`
- `supabase/migrations/20260511193000_phase20_5_offer_deal_hardening.sql`
- `supabase/migrations/20260511210000_phase12_5_admin_reports_review.sql`
- `supabase/migrations/20260511223000_phase14_production_indexes.sql`
- `supabase/migrations/20260511310000_phase15_deal_messages_indexes.sql`
- `supabase/migrations/20260511450000_phase16_message_safety.sql`
- `supabase/migrations/20260512120000_phase24_feedback_center.sql`
- `supabase/migrations/20260512153000_phase28_profile_2_0.sql`
- `supabase/migrations/20260512183000_phase29_publish_item_2_0_story_fields.sql`
- `supabase/migrations/20260512195000_phase33_story_items_and_drops.sql`
- `supabase/migrations/20260512213000_phase34_trust_badges_2_0.sql`
- `supabase/migrations/20260513110000_hotfix_pack1_security_rls.sql`
- `supabase/migrations/20260513143000_hotfix_pack2b_offer_response_atomicity.sql`
- `supabase/migrations/20260513170000_phase38_messaging_2_0_foundation.sql`
- `supabase/migrations/20260514100000_phase39_realtime_messaging.sql`
- `supabase/migrations/20260514123000_phase40_navigation_shell_message_badge_count.sql`
- `supabase/migrations/20260514140000_gp02b_account_deletion_requests.sql`
- `supabase/migrations/20260511194500_phase22a_redirected_followups.sql`

## Supabase utility modules
- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `lib/supabase/actions.ts`
- `lib/supabase/proxy.ts`

## Backend usage in app/server code (feature write/read paths)
- Item create/edit/upload: `app/items/new/actions.ts`, `components/item-form.tsx`, `app/items/[itemId]/edit/actions.ts`
- Offers: `app/offers/new/actions.ts`, `app/offers/[offerId]/actions.ts`
- Deals/messages: `app/deals/[dealId]/actions.ts`, `lib/messages.ts`
- Notifications: `app/notifications/actions.ts`, `lib/notifications.ts`, `lib/shell-request-state.ts`
- Feedback/admin moderation: `app/feedback/actions.ts`, `app/admin/feedback/actions.ts`, `app/admin/drops/actions.ts`, `lib/admin.ts`
- Account deletion: `app/account-deletion/actions.ts`, `app/profile/delete-account/actions.ts`

## Generated types / schema snapshots
No authoritative generated DB types file was found in this repo.

# 3. Final Effective Database Contract
Below is what is directly reconstructible from migrations (plus noted uncertainty from later patches).

## profiles
- Purpose: user identity/profile, trust counters.
- Core columns: `id`, `display_name`, `username`, `avatar_url`, `city`, `area`, `bio`, `successful_swaps_count`, `response_rate`, `is_banned`, `created_at`, `updated_at`.
- Later profile 2.0 additions used in app: `cover_url`, `profile_tagline`, `interests`, `preferred_categories`, `swap_preferences` (from migration + code reads).
- PK: `id` (FK to `auth.users.id`).
- Unique: `username`.
- Trigger: `profiles_updated` (`set_updated_at`), plus `profiles_self_update_guard`.
- RLS: enabled; public select non-banned + self insert/update policies with additional guard function.
- Usage: setup/edit/profile pages and cross-table joins.

## categories
- Purpose: item taxonomy.
- Columns: `id`, `name_ar`, `name_en`, `slug`, `sort_order`, `is_active`, `created_at`.
- PK: `id`; unique `slug`.
- RLS: active-only public read.
- Usage: item creation/edit, listing filters.

## items
- Purpose: listing inventory and state machine anchor.
- Columns (effective): base fields + `item_story`, `swap_reason`, `good_for` (phase29), plus counts/status/source fields.
- PK: `id`.
- FKs: `owner_id -> profiles`, `category_id -> categories`, `created_from_offer_id -> offers`.
- Triggers: `items_updated`, `items_owner_update_guard`.
- RLS: public select for active/reserved/swapped; owner insert/update; owner select added later.
- Usage: browse/feed/profile/offers/deals/curation.

## item_images
- Purpose: media per listing.
- Columns: `id`, `item_id`, `image_url`, `alt_text`, `sort_order`, `is_primary`, `created_at`.
- RLS: public select gated by visible item status; owner all via item ownership.
- Storage coupling: bucket `item-images` with storage object policies.

## item_wanted_tags
- Purpose: item preference tags.
- Columns: `id`, `item_id`, `tag`, `created_at`.
- RLS: public select for visible items; owner all via item ownership.

## offers
- Purpose: swap request lifecycle.
- Columns: `id`, `requested_item_id`, `offered_item_id`, `sender_id`, `receiver_id`, `status`, `message`, `parent_offer_id`, `redirect_type`, `public_note`, `created_at`, `updated_at`, `responded_at`.
- Checks: sender != receiver; requested != offered.
- Triggers/functions: insert/lifecycle guards; atomic response RPCs/hardening.
- RLS: broad select; sender insert; participant lifecycle updates.

## offer_events
- Purpose: immutable-ish event timeline for offers.
- Columns: `id`, `offer_id`, `actor_id`, `event_type`, `old_status`, `new_status`, `note`, `created_at`.
- RLS: public select; participant insert with offer-participation check.

## swap_deals
- Purpose: accepted-offer deal entity and lifecycle.
- Columns: `id`, `offer_id` (unique), `requested_item_id`, `offered_item_id`, `requester_id`, `offerer_id`, `status`, `accepted_at`, `completed_at`, `cancelled_at`, `public_story`, `created_at`, `updated_at`.
- Lifecycle guard function enforces legal status transitions.
- RLS: participant select/update, insert policy for receiver-after-accept flow.

## deal_confirmations
- Columns: `id`, `deal_id`, `user_id`, `confirmed_at`, `note`; unique (`deal_id`,`user_id`).
- RLS: participant select/insert.
- Used by completion flow RPC.

## deal_messages
- Columns: `id`, `deal_id`, `sender_id`, `body`, `created_at`.
- Constraints: body non-blank and <= 800 chars (messaging 2.0).
- RLS: participant select; participant insert only for coordinating/completion-pending deals.

## deal_message_reads
- Added in messaging 2.0.
- Columns: `deal_id`, `user_id`, `last_read_at`, `created_at`, `updated_at`; PK (`deal_id`,`user_id`).
- RLS: self select/insert/update if deal participant.
- RPC: `mark_deal_thread_read(p_deal_id)` upsert read watermark.

## notifications
- Columns: `id`, `user_id`, `type`, `title`, `body`, `item_id`, `offer_id`, `deal_id`, `read_at`, `created_at`.
- RLS: self select/update.
- Functions: `create_notification(...)`; unread counters RPCs.

## reviews
- Columns: `id`, `deal_id`, `reviewer_id`, `reviewee_id`, `rating`, `comment`, `created_at`; unique triple.
- Additional trust dimensions used in app/migrations: `clear_description`, `good_communication`, `on_time`, `respectful_swapper`.
- RLS: public select; insert restricted to authenticated reviewer and later completed-deal participant policy.

## reports
- Columns: `id`, `reporter_id`, `reported_user_id`, `item_id`, `offer_id`, `deal_id`, `reason`, `details`, `status`, `created_at`, `updated_at`.
- Message-safety additions include optional `deal_message_id` linkage (phase16).
- RLS: reporter self select/insert + admin select/update.

## feedback
- Columns: `id`, `user_id`, `feedback_type`, `status`, `subject`, `details`, `page_path`, `admin_note`, `reviewed_by`, `reviewed_at`, `created_at`, `updated_at`.
- Checks constrain feedback/status enums as text, max lengths.
- RLS: self insert/select and admin select/update.

## account_deletion_requests
- Columns: `id`, `user_id`, `email`, `username`, `request_note`, `request_source`, `status`, `created_at`, `updated_at`.
- RLS: anon insert for public flow; authenticated insert with strict source/user constraints.

## creator_drops
- Columns: `id`, `slug`, `title`, `drop_type`, `creator_name`, `intro_copy`, `status`, `created_at`, `updated_at` + checks.
- RLS: published public select; admin all.

## creator_drop_items
- Columns: `drop_id`, `item_id`, `sort_order`, `created_at`; PK (`drop_id`,`item_id`).
- RLS: public select only when drop published and item public; admin all.

## featured_story_items
- Columns: `item_id` (PK/FK), `sort_order`, `curator_note`, `created_at`, `updated_at`.
- RLS: public select for public item statuses; admin all.

## discovery_examples
- Columns: `id`, `query_term`, `category_id`, `example_type`, `title`, `description`, `requested_label`, `offered_label`, `is_real`, `source_offer_id`, `source_deal_id`, `created_at`.
- RLS: public select.

## admin_users
- Columns: `user_id` PK/FK to `profiles`, `created_at`.
- RLS: self select.
- Used as policy gate for admin features.

# 4. Enums and Domain Values
Confirmed enums from migrations:
- `item_condition`: `almost_new`, `good_used`, `minor_issues`, `needs_repair`
- `item_desire_mode`: `specific`, `flexible`, `surprise`
- `item_status`: `active`, `reserved`, `swapped`, `archived`, `removed`
- `item_source`: `direct_listing`, `offer_upload`
- `offer_status`: `pending`, `thinking`, `accepted`, `soft_rejected`, `redirected`, `withdrawn`, `expired`, `cancelled_after_accept`
- `offer_redirect_type`: `offer_another_item`, `ask_for_different_item`, `update_preferences`
- `offer_event_type`: `created`, `marked_thinking`, `accepted`, `soft_rejected`, `redirected`, `withdrawn`, `expired`, `cancelled_after_accept`, `completed`
- `deal_status`: `coordinating`, `completed_pending_confirmation`, `completed`, `cancelled`, `disputed`
- `notification_type`: `offer_received`, `offer_thinking`, `offer_accepted`, `offer_soft_rejected`, `offer_redirected`, `deal_created`, `deal_completed`, `deal_cancelled`, `report_update`, `system`
- `report_reason`: `misleading_item`, `inappropriate_content`, `spam_offer`, `unsafe_behavior`, `no_show`, `other`
- `report_status`: `open`, `reviewing`, `resolved`, `dismissed`
- `discovery_example_type`: `completed_swap`, `possible_swap`, `demand_hint`

Text-check constrained pseudo-enums:
- `feedback.feedback_type`, `feedback.status`
- `creator_drops.status`, `creator_drops.drop_type`
- `account_deletion_requests.request_source`, `account_deletion_requests.status`

# 5. Views, RPCs, Functions, and Triggers
## Views
- No legacy SQL view definition like `marketplace_items` found in this repo.

## Functions/RPCs (confirmed)
- `set_updated_at`
- `handle_new_user`
- `create_notification(...)`
- `accept_offer(p_offer_id uuid)`
- `complete_deal_if_ready(p_deal_id uuid)`
- `mark_offer_thinking(...)`
- `soft_reject_offer(...)`
- `redirect_offer(...)`
- `increment_successful_swaps_for_users(...)`
- `mark_deal_thread_read(p_deal_id uuid)`
- `get_unread_notifications_count()`
- `get_unread_deal_messages_count()`

## Trigger coverage
- updated_at triggers: `profiles`, `items`, `offers`, `swap_deals`, `reports`, `feedback`, `featured_story_items`, `creator_drops`, `deal_message_reads`, `account_deletion_requests`
- auth bootstrap trigger: `on_auth_user_created`
- guard triggers: offer insert/lifecycle guards, deal lifecycle guard, profile/item owner update guards.

Mobile impact: high for offers/deals/messaging/notifications consistency.

# 6. RLS and Security Model
Confirmed model:
- Public-ish discovery reads for active marketplace entities.
- Strong self/owner constraints for profile/item writes.
- Participant-only constraints on deal/message/confirmation access.
- Admin-gated moderation/curation using `admin_users` existence checks.
- Storage object policies for `item-images` bucket owner path matching (`auth.uid()` prefix convention).

Known uncertainty: final effective policy set may differ if live project includes post-repo dashboard edits.

# 7. Storage / Media Contract
Confirmed:
- Bucket: `item-images` used for listing and offer-upload item media.
- Bucket: `profile-images` used by profile update flow in app code.
- Upload path convention in code: `${user.id}/${itemId-or-random}/...` style owner-prefixed object keys.
- Public URL retrieval via `getPublicUrl` for stored images.

Partially unknown:
- live bucket ACL/public toggle for each bucket,
- any additional buckets not referenced in repo,
- final CDN/domain behavior.

# 8. Feature-by-Feature Backend Map
## Profiles
- Tables: `profiles`
- Reads/writes: setup, edit, profile pages
- Logic: auth-trigger bootstrap + guarded self updates

## Marketplace Items
- Tables: `items`, `categories`
- Reads: listings, filters, profile pages
- Writes: create/edit, status transitions during deal lifecycle

## Item Images
- Tables/bucket: `item_images`, `storage.objects(item-images)`
- Writes: upload then insert metadata rows

## Wanted Tags
- Table: `item_wanted_tags`
- Writes: replace-on-edit, insert-on-create

## Offers / Swap Requests
- Tables: `offers`, `offer_events`
- RPC/guards: offer integrity + response atomicity functions

## Offer Events
- Table: `offer_events`
- Writes on offer actions for audit timeline

## Deal Lifecycle
- Table: `swap_deals`
- RPC: `accept_offer`, `complete_deal_if_ready`
- Guarded transition function enforces allowed moves

## Deal Confirmations
- Table: `deal_confirmations`
- Used to finalize completed deal state

## Deal Messaging
- Table: `deal_messages`
- Constraints + participant-gated insert/select

## Message Read State
- Table: `deal_message_reads`
- RPC: `mark_deal_thread_read`

## Notifications
- Table: `notifications`
- Function: `create_notification`
- RPC counters used by shell/dashboard badges

## Reviews
- Table: `reviews`
- Insert gated to participant/completed context

## Reports
- Table: `reports`
- User report creation + admin review updates

## Feedback
- Table: `feedback`
- User submission + admin triage workflow

## Account Deletion
- Table: `account_deletion_requests`
- Separate anon and authenticated submission paths

## Creator Drops
- Tables: `creator_drops`, `creator_drop_items`
- Admin curation + public published read

## Featured Story Items
- Table: `featured_story_items`
- Admin curation + public featured read

## Discovery Examples
- Table: `discovery_examples`
- Public read seeded examples

## Admin/Internal Tools
- Table: `admin_users`
- Used to authorize admin feedback/report/drop actions

# 9. Mobile Reuse Guidance
- **M4 Add Item + Image Upload**: reuse `items`, `item_images`, `item_wanted_tags`, `categories`, `item-images` bucket and owner-path policy model. Do not create mobile-only item/media tables.
- **M5 Offers / Swap Requests**: reuse `offers`, `offer_events`, existing offer response RPCs. Avoid alternate “mobile_offer” schema.
- **M6 Deal Lifecycle**: reuse `swap_deals`, `deal_confirmations`, `accept_offer`, `complete_deal_if_ready` and lifecycle guards.
- **M7 Messaging**: reuse `deal_messages`, `deal_message_reads`, `mark_deal_thread_read`, unread count RPC.
- **M8 Notifications/Profile expansion**: reuse `notifications`, `profiles`, existing profile guarded updates and notification RPC/counters.
- **M9 Trust/Reviews/Reports**: reuse `reviews`, `reports`, `feedback`, `admin_users` moderation gating.
- **M10+ Discovery/Merchandising**: reuse `featured_story_items`, `creator_drops`, `creator_drop_items`, `discovery_examples`.

Where mobile can add thin abstractions:
- read-only views (like already-added `marketplace_items`),
- minimal RPC wrappers for payload simplification.

Do not duplicate core lifecycle state tables in a separate mobile schema.

# 10. Confirmed vs Unknown
## Confirmed from VIRAL repo
- Core public schema entities and many constraints/policies exist in migrations.
- Offer/deal lifecycle is guarded by DB functions/triggers (not only client logic).
- Messaging includes read receipts and participant-only protections.
- Admin moderation/curation access is policy-driven via `admin_users`.

## Unknown / Needs Live Supabase Verification
- Whether live schema has drift beyond repo migrations.
- Exact final function bodies after all applied migrations in production.
- Complete live index landscape and any manual SQL not checked into repo.
- Bucket configuration details (public/private flags, additional buckets, object path drift).
- Whether additional views (including `marketplace_items`) now exist only in live/mobile project.
