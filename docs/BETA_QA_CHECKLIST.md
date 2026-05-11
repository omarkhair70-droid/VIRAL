# Beta QA Checklist (Phase 14 Final)

## A) Auth
- [ ] Google login works.
- [ ] Logout works and session is cleared.
- [ ] Stale cookie check: login in browser A, logout from browser B, verify protected actions re-check auth.
- [ ] First-time user is redirected to profile setup and can complete it.

## B) Profiles
- [ ] Edit profile fields and save.
- [ ] Public profile page renders correctly.
- [ ] User email is not shown publicly.

## C) Items
- [ ] Publish item with valid JPG/PNG/WEBP images.
- [ ] Try unsupported image type and confirm helpful error message appears.
- [ ] Edit item details.
- [ ] Archive then reactivate item.
- [ ] Search/filter items from `/items`.
- [ ] Archived item does not appear in public listing.

## D) Offers
- [ ] Send offer from account B on account A item.
- [ ] Receiver sees incoming offer.
- [ ] Sender sees sent offer.
- [ ] Offer status transitions work: pending/thinking/reject/redirect/accept.

## E) Deals
- [ ] Accepted offer creates deal.
- [ ] Each side can open the deal.
- [ ] One side confirms completion.
- [ ] Other side gets pending confirmation notification.
- [ ] Both sides confirm completion.
- [ ] Deal status becomes completed.
- [ ] Both items become swapped.

## F) Reviews
- [ ] Each side can submit one review only.
- [ ] Duplicate review attempts are blocked.
- [ ] Reviews appear on reviewee public profile.

## G) Reports
- [ ] Submit report against item/profile/offer/deal.
- [ ] Reporter can view own submitted reports.
- [ ] Admin can view all reports.
- [ ] Non-admin cannot access `/admin/reports`.
- [ ] Admin can change report status.
- [ ] Reporter receives status update notification.

## H) Notifications
- [ ] Unread count appears on dashboard/notifications surfaces.
- [ ] Notifications page opens and lists latest entries.
- [ ] Mark one notification as read.
- [ ] Mark all notifications as read.
- [ ] Another account cannot read your notifications.

## I) Mobile Smoke
- [ ] Homepage layout and CTA readability.
- [ ] Header/navigation wraps correctly.
- [ ] Publish item flow is usable.
- [ ] Item detail is readable and actions are accessible.
- [ ] Dashboard stats/actions are usable.
- [ ] Notifications page is usable.
- [ ] Deal page completion actions are usable.

## J) Abuse / Edge Cases
- [ ] User cannot send offer on own item.
- [ ] User cannot report own item.
- [ ] User cannot access another user deal directly.
- [ ] Unauthenticated access to protected pages redirects to login with `next`.
- [ ] Invalid UUID / bad route does not crash app (graceful not-found/error handling).

## K) Deal messages
- [ ] Accepted deal shows message section.
- [ ] Participant A sends message.
- [ ] Participant B sees message.
- [ ] Participant B gets notification.
- [ ] Non-participant cannot access deal/messages.
- [ ] Empty message is blocked.
- [ ] Long message is blocked.
- [ ] Completed deal shows messages read-only.
- [ ] Messages do not appear on public profile.
