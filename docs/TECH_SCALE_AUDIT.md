# TECH & SCALE AUDIT — Phase 19

## A) Current Architecture
- Next.js App Router application.
- Supabase for Auth + Postgres + Storage.
- Vercel deployment model.
- Conservative PWA service worker/offline fallback.
- Server actions used across key flows.

## B) Current Scale Expectation
- Suitable for **controlled beta**.
- Around **500 users/month** is likely manageable under normal usage patterns.
- Actual capacity depends on Supabase/Vercel plan limits, storage/image load, and traffic spikes.
- Not suitable to assume high-scale public launch readiness without monitoring and operational hardening.

## C) Strengths
- RLS exists across core product data surfaces.
- Multiple performance indexes were added.
- Reporting/admin review baseline exists.
- Notifications center exists.
- Deal-message rate limit baseline exists.
- PWA strategy avoids caching authenticated/private pages.

## D) Risks
- Image upload/storage growth can become first operational bottleneck.
- No centralized error monitoring beyond provider dashboards/logs.
- No automated test suite to catch regressions quickly.
- Abuse prevention is baseline-level only.
- Backup/runbook depth is not fully documented.
- Public read policies on offers/offer_events are acceptable for now but need privacy re-check.
- No HEIC conversion path.
- No advanced rate limiting for signups/offers/reports.

## E) Scale Checklist for 500 Users/Month
- Check Supabase Auth/DB/Storage usage weekly.
- Track storage growth and largest upload patterns.
- Monitor Vercel deployment/runtime logs after each release.
- Review slow queries and tighten indexes/query patterns where needed.
- Re-test mobile upload paths regularly.
- Run concurrent offer/message smoke checks.
- Watch for RLS denied spikes and permission anomalies.
- Maintain a clear rollback/recovery checklist before broader beta waves.

## F) Needed Next (Proposed Phase 23)
- Monitoring/logging plan with clear ownership.
- Broader rate-limit coverage (offers/reports/signup surfaces).
- Image upload hardening and format handling strategy.
- Policy tightening review (especially public-scope reads).
- Backup and incident runbook.
- Optional basic smoke test scripts for repeatable release checks.
- Slow query review cadence.
