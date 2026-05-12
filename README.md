# VIRAL / بدّلها

منصة marketplace عربية للتبادل المباشر بين الأفراد (item-for-item swap)، حالياً في **Controlled Beta Marketplace MVP**.

## Current Status
**Phase 20.5 (Security + Source of Truth Freeze)**
- ليست مرحلة branding جديدة.
- ليست UI polish.
- ليست features تجارية جديدة.
- التركيز الحالي: أمان البيانات، lifecycle integrity، وتوحيد الـ source of truth.

## Implemented (Current Beta)
- Auth + profile setup/edit
- Item listing + image uploads
- Discovery/feed/public pages
- Offers creation + owner response lifecycle
- Accepted deal coordination
- Deal confirmations + completion flow
- Reviews
- Reports
- Admin report review
- Notifications center
- Deal-scoped messages
- PWA install + conservative offline fallback
- Sharing/social metadata
- Brand identity foundation docs/assets

## Not Implemented (Out of Scope)
- Payments
- Delivery/logistics
- Escrow
- Advanced AI matching
- Multi-way swaps
- Native mobile app
- Heavy monetization
- Public launch readiness

## Setup
1. Install deps:
   - `npm install`
2. Create local env:
   - copy `.env.example` -> `.env.local`
3. Required env vars:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
4. Run database migrations:
   - `supabase db push`
   - or apply SQL files in `supabase/migrations/` in order.
5. Run app:
   - `npm run dev`

## Supabase / Storage Requirements
- Bucket name: `item-images`
- Bucket posture: **Public read enabled** (marketplace listing photos are publicly accessible)
- Storage path format: `items/{userId}/{itemId}/{timestamp}-{safeFilename}`
- Allowed types: JPG/PNG/WEBP
- Max: 4 images/item, 5MB each

### Public Image Safety Warning (Beta)
Because `item-images` is public-read:
- Do **not** upload private/sensitive photos.
- Do **not** upload phone numbers, home/work addresses, IDs, passports, licenses, or private documents.
- Upload/publish is currently two-step; if upload succeeds and publish fails, orphan files can remain in storage until cleanup tooling is added.

## Build/Test Commands
- Dev: `npm run dev`
- Lint: `npm run lint`
- Build: `npm run build`

## Beta Docs (Source of Truth)
- Current system state: `docs/CURRENT_STATE.md`
- RLS/security posture: `docs/RLS_AUDIT.md`
- Production readiness gaps: `docs/PRODUCTION_READINESS.md`
- Manual QA checklist: `docs/BETA_QA_CHECKLIST.md`


## Operations
- Run smoke check: `npm run smoke` (set `BASE_URL` for preview/local target).
- Runbook: `docs/OPERATIONS_RUNBOOK.md`
- Release checklist: `docs/RELEASE_CHECKLIST.md`
- Monitoring plan: `docs/MONITORING_PLAN.md`
- Incident response: `docs/INCIDENT_RESPONSE.md`
- Storage/image operations: `docs/STORAGE_AND_IMAGES_OPERATIONS.md`

## Closed Beta Launch
- Launch plan: `docs/CLOSED_BETA_LAUNCH_PLAN.md`
- Invite copy: `docs/BETA_INVITE_COPY.md`
- Tracking template: `docs/BETA_TRACKING_TEMPLATE.md`
- Triage guide: `docs/BETA_TRIAGE_GUIDE.md`
- Pre-beta checklist: `docs/PRE_BETA_CHECKLIST.md`
