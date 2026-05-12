# MONITORING PLAN (Phase 23)

## Manual monitoring now
- Vercel build/deployment failures.
- Vercel runtime errors.
- Supabase auth errors.
- Supabase DB errors.
- Supabase storage usage.
- Open/reviewing reports.
- Failed offer/deal actions visible in logs.

## Beta manual metrics
- Users signed up.
- Profiles completed.
- Items published.
- Offers sent.
- Offers accepted.
- Deals completed.
- Reviews left.
- Reports submitted.
- Image upload failures.
- Message/report spam patterns.

## Privacy posture (no analytics yet)
- No tracking scripts were added in Phase 23.
- User privacy remains prioritized.
- Future analytics should be privacy-aware and minimal.

## Current abuse/rate-limit posture
- Deal messages have a basic per-deal message rate limit baseline.
- Offer/deal lifecycle has DB hardening and transition guards.
- Reports are authenticated-only submission flow.

## Recommended next protections
- Offer creation rate limit.
- Report creation rate limit.
- Signup abuse handling.
- Image upload throttling.
- Admin moderation actions expansion.

## Upgrade triggers
- Storage/image growth trend accelerates.
- DB usage approaches plan limits.
- Vercel runtime function errors spike.
- Controlled beta user volume exceeds expected range.

## Note on health endpoint
`/api/health` checks app route availability only, not database health.
