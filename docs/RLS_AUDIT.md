# RLS Audit Summary (Phase 14)

Scope reviewed from current migrations in `supabase/migrations`.

## Global Notes
- RLS is enabled on core user data tables.
- No anonymous writes are allowed in current app flows.
- Admin moderation actions beyond report status updates are intentionally not implemented in this phase.

---

## profiles
- **Read:** Public select for non-banned profiles.
- **Insert:** Authenticated user can insert own profile only.
- **Update:** Authenticated user can update own profile only.
- **Risk/Follow-up:** Public profile data is intentionally visible; keep sensitive fields out of table.

## items
- **Read:** Public for `active/reserved/swapped`; owner select for own items (including archived) exists via Phase 8 policy.
- **Insert:** Authenticated owner only (`owner_id = auth.uid()`).
- **Update:** Owner only.
- **Risk/Follow-up:** Archived items are hidden publicly, visible to owner.

## item_images / item_wanted_tags
- **Read:** Public when parent item is publicly visible.
- **Insert/Update/Delete:** Item owner only.
- **Risk/Follow-up:** Storage policies must remain aligned with DB ownership model.

## offers
- **Read:** Currently broad select policy (`offers_public_select`).
- **Insert:** Sender only.
- **Update:** Offer participants only (sender/receiver).
- **Risk/Follow-up:** `offers_public_select` may need tightening later if privacy concerns increase.

## offer_events
- **Read:** Currently broad select policy (`offer_events_public_select`).
- **Insert:** Offer participants only.
- **Update:** Not used in app flow.
- **Risk/Follow-up:** `offer_events_public_select` may need tightening later.

## swap_deals
- **Read:** Deal participants only.
- **Insert:** Accept-flow constrained insert policy exists (Phase 5).
- **Update:** Deal participants only.
- **Risk/Follow-up:** Good baseline for privacy.


## deal_messages
- **Read:** Deal participants only (`deal_messages_participant_select`).
- **Insert:** Authenticated deal participant only with `sender_id = auth.uid()` (`deal_messages_participant_insert`).
- **Update/Delete:** Not exposed in current app flow.
- **Risk/Follow-up:** Message reporting/moderation may be added later.

## deal_confirmations
- **Read:** Deal participants only.
- **Insert:** Authenticated participant can confirm self only (`user_id = auth.uid()`).
- **Update:** Not required in normal flow.
- **Risk/Follow-up:** Unique `(deal_id, user_id)` prevents duplicates.

## reviews
- **Read:** Public.
- **Insert:** Completed-deal participant insert policy (Phase 10).
- **Update:** Not needed in current UX.
- **Risk/Follow-up:** Public visibility is intentional for trust.

## reports
- **Read:** Reporter can read own reports; admins can read all.
- **Insert:** Reporter self insert only.
- **Update:** Admin-only report status updates.
- **Risk/Follow-up:** Admin action surface is intentionally limited to report status.

## notifications
- **Read:** Notification owner only.
- **Insert:** Through server-side app flow / RPC.
- **Update:** Notification owner only (mark read).
- **Risk/Follow-up:** Keep server actions from leaking cross-user IDs.

## admin_users
- **Read:** Authenticated user can read own admin row.
- **Insert/Update:** Manual DB management outside app UI.
- **Risk/Follow-up:** This table is the admin gatekeeper; restrict manual access.

## discovery_examples
- **Read:** Public select.
- **Insert/Update:** Not exposed in app UI.
- **Risk/Follow-up:** Safe as static/discovery content.

- reports.deal_message_id stores per-message report context for deal chat safety.
- deal_messages_admin_select policy allows admin-only read for reviewing reported message snippets.
- Future moderation may add hide/delete actions, but Phase 16 only records reports.
