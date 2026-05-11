# RLS Audit Summary (Phase 20.5)

Scope reviewed from current migrations in `supabase/migrations` including Phase 20.5 hardening.

## Key hardening changes
- Replaced broad participant update posture with lifecycle-enforced update posture for:
  - `offers` (`offers_participant_update` -> `offers_participant_lifecycle_update`)
  - `swap_deals` (`deals_participant_update` -> `deals_participant_lifecycle_update`)
- Added DB triggers/functions:
  - `enforce_offer_lifecycle` + `offers_lifecycle_guard`
  - `enforce_swap_deal_lifecycle` + `swap_deals_lifecycle_guard`
- Added RPCs:
  - `accept_offer(uuid)` (atomic accept + reserve both items + deal + event)
  - `complete_deal_if_ready(uuid)` (confirmation-gated completion)

## Offers posture
- Sender insert only.
- Participant update still limited by RLS, but lifecycle trigger now blocks illegal transitions and identity-field mutation.
- Immutable after insert: `requested_item_id`, `offered_item_id`, `sender_id`, `receiver_id`, `parent_offer_id`.
- Allowed transitions enforced in DB:
  - `pending -> thinking` (receiver only)
  - `pending/thinking -> accepted|soft_rejected|redirected` (receiver only)
  - `pending/thinking -> withdrawn` (sender only)
  - `accepted -> cancelled_after_accept` (participant only)
  - terminal states blocked from arbitrary mutation

## Swap deals posture
- Participant update still RLS-limited, plus lifecycle trigger validation.
- Immutable after insert: `offer_id`, `requested_item_id`, `offered_item_id`, `requester_id`, `offerer_id`.
- Completion integrity:
  - `completed` requires 2 confirmations at DB level.
  - `completed` terminal.
  - legal transitions only from coordinating/pending-confirmation states.

## Remaining known security risks
- `item-images` bucket is public-read by product choice.
- User-upload safety depends on copy/education + future moderation/cleanup tooling.


## Phase 22A follow-up offer integrity
- `enforce_offer_insert_integrity` now validates `parent_offer_id` when present.
- Follow-up insert requires redirected parent, same sender/receiver/requested item, different offered item, pending status, active/owned items.
- Added partial unique index `offers_unique_active_followup` on `(parent_offer_id, offered_item_id)` for active statuses (`pending`,`thinking`,`accepted`) to block duplicate active follow-ups.
