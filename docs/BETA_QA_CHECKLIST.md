# Beta QA Checklist (Phase 20.5 Security Freeze)

## Offers / RLS / Lifecycle
- [ ] Sender cannot accept own sent offer.
- [ ] Receiver cannot change `requested_item_id`/`offered_item_id`.
- [ ] Malicious participant cannot force illegal offer status transition.
- [ ] Accepting offer sets offer status to `accepted`.
- [ ] Accepting offer reserves both requested + offered items.
- [ ] Accepted/reserved items no longer behave as freely active listing inventory.

## Deals / RLS / Lifecycle
- [ ] Malicious participant cannot mutate immutable deal identity fields.
- [ ] Deal cannot become `completed` without both confirmations.
- [ ] Second confirmation transitions deal to `completed`.
- [ ] Completed deal updates both items to `swapped`.
- [ ] Completed deal is terminal (cannot revert to coordinating).

## Visibility / data safety
- [ ] Archived/removed items stay hidden from public surfaces.
- [ ] Public images still load from `item-images` bucket.
- [ ] Item publish UI shows warning to avoid private/sensitive images.

## Regression checks
- [ ] Existing offer pages still work.
- [ ] Existing deal pages still work.
- [ ] Reports flow still works.
- [ ] Admin reports review still works.
- [ ] Notifications still build/send/read/mark-as-read.

## Build
- [ ] `npm run build` passes.


## N. UI Design System regression
- [ ] item detail offer/report/share still works
- [ ] item publish still submits with image
- [ ] item edit still saves
- [ ] archive/reactivate still works
- [ ] deal list opens
- [ ] deal messages still send
- [ ] message report link still works
- [ ] deal confirmation still works
- [ ] review submit still works
- [ ] report submit still works
- [ ] profile setup/edit still works
- [ ] public profile reviews still show
- [ ] dashboard item/actions still work
- [ ] no mobile overflow
- [ ] bottom nav does not cover form submit buttons


## O. Redirected offer follow-up
- [ ] receiver redirects offer with public note.
- [ ] sender sees “ابعت عرض تاني” CTA.
- [ ] sender can create follow-up with different item.
- [ ] follow-up has `parent_offer_id`.
- [ ] receiver gets notification.
- [ ] follow-up appears as pending offer.
- [ ] sender cannot reuse same original offered item.
- [ ] non-sender cannot create follow-up.
- [ ] follow-up blocked if requested item unavailable.
- [ ] duplicate active follow-up blocked.
- [ ] normal offer creation still works.


## P. Core UX Flow Elevation
- [ ] homepage first action is clear
- [ ] beta page explains controlled beta
- [ ] item publish helper copy appears
- [ ] marketplace empty state explains no results
- [ ] item detail has one main offer CTA
- [ ] send offer page explains existing vs new item mode
- [ ] redirected follow-up explains different item requirement
- [ ] offer response panel explains consequences
- [ ] deal page step tracker matches status
- [ ] deal message copy explains not realtime
- [ ] completion/review copy appears in correct states
- [ ] report page explains what happens next
- [ ] notifications page explains in-app nature
- [ ] profile pages explain trust/reviews

## Q. Deal + Offer UX Clarity
- [ ] offer receiver understands accept/thinking/reject/redirect consequences
- [ ] sender redirected state shows “ابعت عرض تاني” explanation
- [ ] send offer page explains existing vs new item mode
- [ ] follow-up mode explains different item requirement
- [ ] deal page step tracker matches coordinating status
- [ ] deal page step tracker matches pending confirmation status
- [ ] completed deal shows review guidance
- [ ] message section explains not realtime
- [ ] message safety copy appears
- [ ] confirmation warning appears before action
- [ ] report page explains what happens next
- [ ] deals empty state explains when deals appear


## R. Scale / Reliability / Monitoring
- [ ] `npm run build` passes.
- [ ] `npm run smoke` passes against local/preview URL.
- [ ] `/api/health` returns `{ ok: true, app: "baddelha", status: "up" }`.
- [ ] `/admin/ops` is admin-only.
- [ ] `/admin/ops` shows aggregate counts only.
- [ ] `/admin/ops` does not expose emails/messages/auth IDs.
- [ ] `/admin/reports` still works.
- [ ] item/offer/deal flows still work after Phase 23.
- [ ] public pages still load.
- [ ] PWA offline still loads.
- [ ] no private routes cached by service worker.
- [ ] storage public image warning remains visible.


## S. Feedback Center / Admin Ops
- [ ] logged-out user redirected from `/feedback`
- [ ] logged-in user can submit feedback
- [ ] feedback success state appears
- [ ] user can view own feedback in `/dashboard/feedback`
- [ ] user cannot see other users’ feedback
- [ ] admin can open `/admin/feedback`
- [ ] non-admin cannot open `/admin/feedback`
- [ ] admin can update feedback status/note
- [ ] `/admin/ops` shows aggregate feedback counts only
- [ ] no emails/auth IDs shown

## T. Closed Beta Launch
- [ ] `/beta` explains closed beta clearly
- [ ] invite copy ready
- [ ] pre-beta checklist completed
- [ ] `npm run smoke` passes against production
- [ ] first 10 tester plan documented
- [ ] `/feedback` works
- [ ] `/admin/feedback` works
- [ ] `/admin/ops` shows beta watch section
- [ ] tracking template created
- [ ] stop/expand conditions documented


## U. Profile 2.0
- [ ] existing user can open /profile
- [ ] avatar upload succeeds with valid image
- [ ] avatar rejects invalid type/oversize
- [ ] cover upload succeeds with valid image
- [ ] cover rejects invalid type/oversize
- [ ] profile update saves new fields
- [ ] public profile shows cover/avatar/tagline/bio/location
- [ ] public profile handles missing cover/avatar gracefully
- [ ] public profile shows trust summary
- [ ] public profile shows swap personality section
- [ ] active items section still works
- [ ] reviews section still works
- [ ] share profile still works
- [ ] report user still works
- [ ] logged-out guest can view public profile
- [ ] no sensitive storage path leak or private bucket exposure
