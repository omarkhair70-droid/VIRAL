# RELEASE CHECKLIST (Phase 23)

## Before merge
- [ ] PR summary reviewed and scope is Phase-safe.
- [ ] `npm run build` passed.
- [ ] No unintended DB or migration changes.
- [ ] No server action field rename/break unless intended.
- [ ] No public/private data leak risk.
- [ ] Migration (if any) explicitly identified.

## After merge
- [ ] Deployment is ready/green.
- [ ] If migration exists: apply Supabase migration first.
- [ ] Test top 5 flows (auth, publish, offer, deal, messages).
- [ ] Check Vercel logs for runtime/build errors.
- [ ] Check Supabase logs for auth/DB errors.

## Release gates
- **P0 (block/rollback):** auth broken, publish broken, offer broken, deal broken, messages broken, public data leak.
- **P1 (fix fast):** image upload flaky, notifications issue, admin report issue.
- **P2 (non-blocking):** copy/UI issues.
