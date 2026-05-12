# INCIDENT RESPONSE (Phase 23)

## 1) Vercel build failure
- Symptoms: latest deploy fails before ready.
- First check: failing build step/log line.
- Immediate action: revert recent breaking commit or fix and redeploy.
- Rollback note: keep last known-good deployment active.
- Follow-up prevention: require pre-merge `npm run build`.

## 2) Supabase migration failure
- Symptoms: SQL apply fails; runtime schema mismatch errors.
- First check: exact failing migration statement.
- Immediate action: stop app rollout depending on migration.
- Rollback note: deploy code compatible with current DB state.
- Follow-up prevention: dry-run migration in staging/local first.

## 3) Auth/login broken
- Symptoms: login redirect loops / callback errors.
- First check: `/auth/callback` and auth env config.
- Immediate action: rollback immediately if users blocked.
- Rollback note: revert auth-related code/env changes.
- Follow-up prevention: add auth flow to release top-5 flow checks.

## 4) Image upload broken
- Symptoms: uploads fail or images not visible on items.
- First check: bucket policy, file size/type limits, client errors.
- Immediate action: communicate temporary limitation + stabilize flow.
- Rollback note: revert upload path changes if introduced.
- Follow-up prevention: track upload failure rate weekly.

## 5) Offer acceptance broken
- Symptoms: accept action errors; items not reserved/deal not created.
- First check: `accept_offer` RPC errors and offer/deal logs.
- Immediate action: rollback release if core swap loop blocked.
- Rollback note: preserve DB integrity over partial fixes.
- Follow-up prevention: always smoke + manual offer flow check post-release.

## 6) Deal completion broken
- Symptoms: completion fails despite confirmations.
- First check: confirmation rows + `complete_deal_if_ready` behavior.
- Immediate action: rollback if completion path is blocked widely.
- Rollback note: do not bypass lifecycle guardrails in production.
- Follow-up prevention: weekly manual full swap completion test.

## 7) Message/report spam
- Symptoms: repeated abusive messages or report floods.
- First check: repeated sender/target patterns and timestamps.
- Immediate action: manual admin review + status updates + containment.
- Rollback note: N/A unless caused by release bug.
- Follow-up prevention: add offer/report/signup throttling in next phase.

## 8) Public data/privacy issue
- Symptoms: sensitive data exposed in public route/storage.
- First check: exact exposed field/object path.
- Immediate action: hide endpoint/content, rollback if needed, notify team.
- Rollback note: prioritize immediate containment.
- Follow-up prevention: enforce aggregate-only admin ops views and review RLS/docs.

## 9) PWA/service worker stale behavior
- Symptoms: old UI or stale route behavior after deploy.
- First check: SW cache version + cached assets list.
- Immediate action: bump SW cache name/version and redeploy.
- Rollback note: fallback to network-first navigation remains available.
- Follow-up prevention: keep private routes out of cache and retest offline route.
