# Beta QA Checklist (Phase 11)

Manual end-to-end checks before inviting first beta users:

1. Sign up as a new user with Google.
2. Complete profile setup (username, city, area, bio).
3. Publish one item with 1–4 images.
4. Search and filter items from `/items`.
5. From a second account, send an offer on that item.
6. In receiver account, accept the offer.
7. Confirm deal page opens from `/deals`.
8. Both users confirm completion from deal page.
9. Both users leave reviews.
10. Verify reviews appear on public profile pages.
11. Archive an item then reactivate it from dashboard items.
12. Edit an existing item details and verify saved changes.
13. Mobile checks (responsive + usability):
   - Homepage
   - Item publish page
   - Dashboard
   - Deal page
14. Report an item from a second account.
15. Report an offer as a participant.
16. Report a deal as a participant.
17. Report a public user profile.
18. Verify report success message appears after submit.
19. Verify reports are not publicly visible.

## Phase 12.5 — Admin Reports Review

- Admin user must be manually inserted into `public.admin_users` in Supabase.
- Add current user to `public.admin_users` manually.
- Open `/admin/reports` as admin.
- Confirm all reports are visible.
- Change report status to `reviewing`.
- Change report status to `resolved`.
- Log in as non-admin and confirm `/admin/reports` is not accessible.

## Phase 13 — Notifications Center
- [ ] Create an offer and verify receiver gets notification.
- [ ] Respond to offer and verify sender gets notification.
- [ ] Accept offer and verify deal-created notification.
- [ ] Confirm deal from one side and verify other side gets pending confirmation notification.
- [ ] Complete deal and verify both get completed notification.
- [ ] Submit review and verify other side gets review notification.
- [ ] Update report status as admin and verify reporter gets report update notification.
- [ ] Mark one notification read.
- [ ] Mark all notifications read.
- [ ] Verify another account cannot see these notifications.
