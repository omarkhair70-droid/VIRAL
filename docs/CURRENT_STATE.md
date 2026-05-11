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
