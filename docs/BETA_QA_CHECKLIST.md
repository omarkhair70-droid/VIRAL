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
- [ ] Home CTAs still work.
- [ ] Marketplace search/filter still works.
- [ ] Item detail offer/report/share still works.
- [ ] Item publish form still submits.
- [ ] Item edit still saves.
- [ ] Dashboard links still work.
- [ ] Received/sent offer tabs still work.
- [ ] Offer response buttons still work.
- [ ] Deal messages still send.
- [ ] Deal confirmation still works.
- [ ] Review submit still works.
- [ ] Notifications mark-read still works.
- [ ] Report submit still works.
- [ ] Admin report status update still works.
- [ ] Profile setup/edit still works.
- [ ] Mobile bottom nav does not cover buttons.
- [ ] No horizontal overflow on mobile.
