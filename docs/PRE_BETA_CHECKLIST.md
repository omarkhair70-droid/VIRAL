# Pre-Beta Checklist (Phase 25)

## Before sending beta link
- [ ] `npm run build` passed.
- [ ] `BASE_URL=<production-url> npm run smoke` passed.
- [ ] `/api/health` is OK.
- [ ] `/admin/ops` opens for admin only.
- [ ] `/feedback` works for logged-in user.
- [ ] `/admin/feedback` works for admin only.
- [ ] Publish item with image tested.
- [ ] Normal offer tested.
- [ ] Redirected follow-up tested.
- [ ] Accept offer tested.
- [ ] Deal messages tested.
- [ ] Completion/review tested.
- [ ] Report tested.
- [ ] PWA/install page opens.
- [ ] Mobile quick check done.
- [ ] Supabase storage checked.
- [ ] Vercel latest deployment is OK.

## Beta link to send
- Prefer `/beta` first.
- Then user can go to `/items` or `/items/new`.
