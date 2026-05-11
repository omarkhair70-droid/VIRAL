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
