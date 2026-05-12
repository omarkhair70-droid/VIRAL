# OPERATIONS RUNBOOK (Phase 23)

## Current operating mode
- Controlled beta (not public launch).
- Manual admin supervision remains required.
- Focus: reliability and safe operations at ~500 users/month.

## Daily routine
- Review `/admin/reports` for open/reviewing cases.
- Review `/admin/ops` for aggregate platform snapshot.
- Check latest Vercel deployment status + runtime logs.
- Check Supabase auth/database/storage usage and errors.
- Review user-reported issues and triage severity.

## Weekly routine
- Check storage growth for `item-images`.
- Check open report backlog and resolution latency.
- Run `npm run smoke` on local/preview URL.
- Execute one full end-to-end swap flow manually.
- Review any reported slow/problematic queries.
- Review image upload failures and orphan risk symptoms.

## Critical manual flow checks
Login/profile setup → publish item with image → send offer → redirected follow-up offer → accept offer → deal messages → confirm completion → review → report → admin report update → notifications.

## What to watch
- Upload failures / size/type failures.
- RLS permission denied spikes.
- Offer/deal RPC errors.
- Storage growth and plan pressure.
- Repeated report spam patterns.
- Failed deployments.

## Rollback rules
- If release breaks offer/deal creation: rollback immediately.
- If migration fails: do not deploy code that depends on it.
- If auth callback/login breaks: rollback immediately.

- Review recurring confusion/bug themes from `/admin/feedback` and feed them into backlog prioritization.
- Review `/admin/feedback` for newly submitted beta feedback.