# Production Readiness (Phase 14)

## 1) Current MVP Status
Current production beta MVP includes:
- Authentication (Google login) + session handling
- Profile setup and public profiles
- Item publishing with image uploads
- Marketplace browse/search/filter
- Offers lifecycle
- Deals lifecycle + completion confirmations
- Reviews after completed swaps
- Safety reports
- Admin reports review page
- Notifications center
- Deal-scoped coordination messages inside deal page

## 2) Required Manual Supabase Setup
Before broad beta access, confirm all of the following are already applied:
- Storage bucket `item-images` exists and is **public**.
- Phase 10 successful swaps migration/RPC is applied.
- Phase 12.5 `admin_users` migration is applied.
- Phase 13 `create_notification` RPC/migration is applied.
- At least one admin user is manually inserted in `public.admin_users`.

## 3) Required Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

## 4) Pre-Beta Checks (Must Pass)
- Google login works.
- Profile setup redirect works.
- Item publish with at least 1 image works.
- Offer flow works end-to-end.
- Deal completion works from both sides.
- Review appears on public profile.
- Report flow works.
- Admin report review works.
- Notifications create/show/mark-as-read works.
- Mobile smoke test works on key pages.

## 5) Known Limitations
- Messages are page-refresh based, not real-time.
- No delivery or payments.
- No push/email notifications.
- No HEIC image conversion.
- No automated moderation.
- No ban/suspend system.
- No service-level uptime guarantee.

## 6) Monitoring Checklist
- Check Vercel production deployment status after each release.
- Check Vercel runtime logs after beta user sessions.
- Check Supabase Auth/Database/Storage usage trends.
- Monitor image upload failure rate.
- Monitor RLS denied/permission errors in logs.

- Deal messages include per-message reporting and basic per-deal rate limit.
- Known limitation: Rate limiting is simple DB-backed beta protection, not a full abuse prevention system.


## 7) PWA and Offline Behavior (Phase 17)
- PWA setup exists (`manifest.webmanifest`, app icons, service worker registration).
- Offline fallback is navigation-only and conservative (`/offline`), not full offline data mode.
- No push notifications yet.
- No offline writes/background sync.
- Privacy rule: do not cache authenticated/private pages (dashboard, deals, notifications, admin, auth).
