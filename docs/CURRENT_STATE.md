# VIRAL / بدّلها — Current State (Phase 20.5)

## What it is
VIRAL (بدّلها) is an Arabic-first item swap marketplace MVP where users list items and exchange through offers and coordinated deals.

## Product stage
- **Controlled beta marketplace MVP** (not public launch ready).
- Phase 20.5 focuses on security/lifecycle/source-of-truth hardening.

## Implemented capabilities
- Auth/profile lifecycle
- Listing items with images
- Discovery/feed/public item/profile pages
- Offer send/respond flow
- Redirected offer follow-up loop (sender can send linked follow-up offer via `parent_offer_id`)
- Deal creation and coordination
- Deal confirmation-based completion
- Reviews after completed swaps
- Reports + admin review surface
- In-app notifications
- Deal messages
- PWA install + offline fallback
- Sharing/social metadata

## Implemented routes (high-level)
`/`, `/feed`, `/discover`, `/items`, `/items/new`, `/items/[itemId]`, `/offers/new`, `/offers/[offerId]`, `/deals`, `/deals/[dealId]`, `/notifications`, `/dashboard/*`, `/profile`, `/users/[username]`, `/report`, `/admin/reports`, `/install`, `/offline`, `/beta`.

## Implemented tables (core)
`profiles`, `categories`, `items`, `item_images`, `item_wanted_tags`, `offers`, `offer_events`, `swap_deals`, `deal_messages`, `deal_confirmations`, `reviews`, `reports`, `notifications`, `admin_users`, `discovery_examples`.

## Storage buckets posture
- `item-images`: **public-read**.
- Listing images are intentionally public for marketplace visibility.
- Safety warning: users must avoid sensitive/private uploads.

## Current security model
- RLS enabled on core tables.
- Ownership/participant checks in policies.
- Phase 20.5 adds DB lifecycle guards for `offers` and `swap_deals`.
- `accept_offer` RPC enforces atomic accept + reserve both items + ensure deal/event creation.
- `complete_deal_if_ready` RPC + trigger rules enforce both confirmations before completion and keep completed terminal.

## Known beta risks
- Public image bucket means privacy risk if users upload sensitive data.
- Upload succeeds before publish can still leave orphan storage files.
- No payments/delivery/escrow.
- No realtime messaging.
- No advanced abuse automation beyond current controls.

## Next recommended phase
- **Phase 21 UI Design System** (after this hardening baseline is merged and validated).

## Conflict rule (source of truth)
If docs and implementation differ, **current code + SQL behavior wins**; docs must be updated to match runtime truth immediately.


## Phase 23 operational additions
- Admin ops snapshot route: `/admin/ops` (admin-only, aggregate metrics).
- Smoke test script: `scripts/smoke-test.mjs` (`npm run smoke`, configurable `BASE_URL`).
- Health endpoint: `/api/health` (lightweight app-up JSON only).
- Operations docs set: runbook, release checklist, monitoring plan, incident response, storage/image operations.


## Phase 24 feedback center additions
- User feedback route: `/feedback` (authenticated submit only).
- User feedback history route: `/dashboard/feedback` (owner-only via RLS).
- Admin feedback review route: `/admin/feedback` (admin-only review/status update).
- Dashboard now includes a beta feedback entry card.

## Phase 25 closed beta readiness additions
- Closed beta launch plan created (`docs/CLOSED_BETA_LAUNCH_PLAN.md`).
- Invite copy scripts created (`docs/BETA_INVITE_COPY.md`).
- Manual tracking template created (`docs/BETA_TRACKING_TEMPLATE.md`).
- Triage guide created (`docs/BETA_TRIAGE_GUIDE.md`).
- Pre-send launch gate checklist created (`docs/PRE_BETA_CHECKLIST.md`).


## Phase 26 Direction Update (May 12, 2026)
- Current state remains controlled beta MVP.
- Season 2 premium product direction is now documented.
- Next implementation phase should be Profile 2.0.


## Phase 28 Profile 2.0 (May 12, 2026)
- Public profile now includes cover/avatar hero, trust summary, swap personality, richer items, and upgraded reviews hierarchy.
- `/profile` now supports avatar/cover uploads and Season 2 profile fields.
- New `profile-images` bucket is public-read; profile images are public and users should avoid sensitive uploads.

## Phase 28.5 Mobile App Shell 2.0 + Home Experience Reset (May 12, 2026)
- Mobile shell refined to feel app-native: compact mobile header utilities + improved bottom nav hierarchy.
- Logged-in home now prioritizes action-oriented app entry (publish/market/notifications/account) instead of a long landing-only experience.
- Mobile spacing/safe-area/footer behavior polished so content stays clear above bottom navigation.


## Phase 29 Publish Item 2.0 (May 12, 2026)
- `/items/new` now runs as a guided 6-step publish wizard (images, basics, condition clarity, story, desired swap, review/publish).
- Story Item fields (`item_story`, `swap_reason`, `good_for`) are captured on publish and editable later.
- Item detail shows a minimal "حكاية الحاجة" section when story data exists (full Item Detail 2.0 still pending Phase 30).


## App Feel 3.0 — Icon System Integration (May 12, 2026)
- Official Baddelha UI icon system integrated into core mobile navigation, mobile header utility actions, and key empty states.
- Temporary mixed emoji/inline icon usage was replaced in these core surfaces to keep icon language unified.

## Phase 30 Item Detail 2.0 (May 12, 2026)
- `/items/[itemId]` upgraded from basic listing details to a premium decision-first product page hierarchy.
- New structure emphasizes hero gallery + stronger header + dedicated swap CTA module + trust card + calm safety strip.
- Story fields now render as a focused "حكاية الحاجة" block only when content exists.
- "More from this user" compact section now appears conditionally when other active items exist.

## Phase 31 Offer Flow 2.0 (May 12, 2026)
- `/offers/new` upgraded into a guided offer composer with clearer hierarchy and requested-item spotlight.
- Existing vs quick-new offer input is now clearer, with improved existing item visual selection.
- Added stronger offer review/preview, lightweight message helper, and swap rationale support copy.
- Redirected follow-up context at offer creation is now clearer while keeping all existing validations and lifecycle behavior.


## Phase 32 Deal Room 2.0 (May 12, 2026)
- `/deals/[dealId]` now follows a clearer room hierarchy with prominent status, swap summary hero, and next-step guidance.
- Participant cards now clarify both sides (you/other participant) with profile links and optional profile visuals when available.
- Deal progress now appears as a stronger stages/checklist module with practical coordination reminders.
- Messages, completion confirmation, completed success state, and review actions are organized into clearer room sections without changing backend deal logic.

## Phase 33 — Story Items + Drops
- Story label now appears on story-rich items.
- Featured story items are curated manually by admins.
- Public /drops page added for curated discovery.
- Admin /admin/drops page added for drops + featured story curation.

## Phase 34 — Trust Badges 2.0 (May 12, 2026)
- Completed-deal reviews now support optional positive trust endorsements (clear description, good communication, on-time, respectful swapper).
- Public profiles now aggregate and display review-backed trust badges with calm, count-based signals.
- Item detail owner trust card now includes a compact trust badge preview to support faster send-offer decisions.
- Beta Member and Completed Swapper remain derived, honest presentation badges.

## Phase 35 — App Feel 2.0 (May 12, 2026)
- Mobile bottom nav now uses route-aware active states while preserving auth gating and unread badge logic.
- Home now includes a lightweight install onboarding card driven by `beforeinstallprompt`, with standalone/dismiss safeguards.
- Global and route-level loading states were upgraded with a reusable branded loading surface.
- `/offline` now renders a stronger app-state recovery experience with direct recovery actions.
- Deals, dashboard items, and drops empty states were polished for visual consistency using `EmptyState`.
