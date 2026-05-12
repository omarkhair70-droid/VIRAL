# Production Readiness (Phase 20.5)

## Current state
Controlled beta marketplace MVP with hardened offers/deals lifecycle protections.

## Required Supabase state
- All migrations applied, including `20260511193000_phase20_5_offer_deal_hardening.sql`.
- `item-images` bucket exists and is public-read.
- `profile-images` bucket exists and is public-read (avatar/cover are intentionally public).
- At least one row in `admin_users` for moderation review.

## Security/lifecycle baseline checks
- `accept_offer` RPC exists and executes for receiver only.
- Accepting offer reserves both involved items.
- Deal completion cannot become `completed` before both confirmations.
- `offers` and `swap_deals` lifecycle triggers exist and block invalid transitions.
- Redirected offers support linked follow-up creation with DB integrity checks and duplicate-active-follow-up prevention.

## Beta limitations (known)
- Public listing images are public URLs.
- Public profile avatar/cover images are public URLs.
- Upload->publish split can leave orphan storage files if publish fails.
- No payments, escrow, delivery, or advanced AI matching.
- No push/email notifications.
- Messaging is non-realtime.

## Manual pre-release checks
- Run `npm run build`.
- Run full `docs/BETA_QA_CHECKLIST.md`.
- Verify reports/admin review/notifications continue working after migration.


## Phase 23 operational readiness update
- Added practical operations docs: runbook, release checklist, monitoring plan, incident response, storage/image operations.
- Added admin operational snapshot route: `/admin/ops` (admin-only, aggregate counts only).
- Added health endpoint: `/api/health` (app route availability only; no DB check).
- Added smoke command: `npm run smoke` (supports `BASE_URL`).
- Remaining limits: no broad offer/report/signup throttling yet, no automated orphan image cleanup, no third-party monitoring integration.

- Feedback center available for controlled beta issue intake.
- Admin feedback review page available.
- Remaining: no automated moderation/ban tools yet.


## Phase 29 note
- Story item fields (`item_story`, `swap_reason`, `good_for`) are public listing content and should not contain sensitive/private information.
