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
- [ ] `/api/health` returns `{ ok: true, app: "teswa", status: "up" }`.
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


## V. Mobile App Shell 2.0
- [ ] mobile header no longer wraps full nav into multiple lines
- [ ] mobile top bar looks compact and stable
- [ ] desktop header still works
- [ ] logged-in bottom nav visible and tappable
- [ ] bottom nav content not duplicated in top mobile header
- [ ] bottom nav does not cover page content
- [ ] safe-area spacing reasonable on iPhone-style screens
- [ ] notifications count still visible where intended
- [ ] logged-out home still explains the product clearly
- [ ] logged-in home feels app-like and action-oriented
- [ ] home CTAs still route correctly
- [ ] footer does not visually fight bottom nav on mobile
- [ ] `npm run build` passes


## W. Publish Item 2.0
- [ ] logged-in user can open /items/new
- [ ] logged-out user still sees sign-in guidance
- [ ] wizard step progression works
- [ ] back navigation keeps entered data
- [ ] cannot proceed without required image/title fields where appropriate
- [ ] valid images preview correctly
- [ ] invalid image type rejected
- [ ] oversize image rejected
- [ ] item story optional fields accept valid content
- [ ] story fields respect character limits
- [ ] final review step shows accurate entered content
- [ ] publish uploads images and creates item
- [ ] new story fields saved successfully
- [ ] after publish item detail displays "حكاية الحاجة" block if story data exists
- [ ] item edit page loads story fields
- [ ] item edit saves story field updates
- [ ] existing listings without story fields still render normally
- [ ] build passes


## X. App Feel 3.0 — Icon System Integration
- [ ] Bottom nav uses official icons and still navigates correctly.
- [ ] Notification badge still appears and caps at 9+.
- [ ] Mobile header shows proper icons for notifications/account/login.
- [ ] Existing aria labels remain valid.
- [ ] Empty states in marketplace and notifications display official icons.
- [ ] Layout does not shift unexpectedly on mobile.
- [ ] No emoji icons remain in touched header/nav locations.
- [ ] `npm run build` passes.

## Y. Phase 30 — Item Detail 2.0
- [ ] item with story fields shows "حكاية الحاجة" with the expected values
- [ ] item without story fields does not show an empty story block
- [ ] logged-in non-owner sees main CTA and routes to `/offers/new?requestedItemId=...`
- [ ] logged-out visitor sees "سجّل وابعث عرض" and auth path behavior still works
- [ ] owner view shows "دي حاجتك أنت." and edit/manage actions as secondary
- [ ] multi-image item shows primary hero + secondary image strip
- [ ] single-image item still renders correctly
- [ ] no-image item still shows fallback state
- [ ] desire_mode / desire_text / wanted tags block renders correctly
- [ ] owner trust card shows profile data and profile link when available
- [ ] "حاجات تانية من نفس الشخص" appears only when there are other active items
- [ ] share/report/manage secondary actions remain available and quiet
- [ ] mobile ordering remains clear and desktop 2-column hierarchy is sane
- [ ] `npm run build` passes

## Z. Phase 31 — Offer Flow 2.0
- [ ] normal offer starts from Item Detail 2.0 CTA (`/offers/new?requestedItemId=...`)
- [ ] existing active item mode shows selectable visual item list
- [ ] quick new item mode renders all supported fields and guidance copy
- [ ] submit still creates offer successfully
- [ ] quick-created offer item appears in marketplace like before
- [ ] offered/requested preview block is clear before submit
- [ ] message helper prompts appear and remain optional
- [ ] redirected follow-up flow works via `/offers/new?fromOffer=...`
- [ ] redirected follow-up still blocks reusing same previous offered item
- [ ] invalid/unavailable parent offer behavior remains unchanged
- [ ] logged-in protection still redirects unauthenticated users
- [ ] `npm run build` passes
- [ ] mobile layout ordering and CTA clarity are sane

## AA. Phase 32 — Deal Room 2.0
- [ ] coordinating deal room renders correctly
- [ ] completed_pending_confirmation state renders correctly
- [ ] completed deal room renders success/review state
- [ ] cancelled/disputed messaging still renders
- [ ] offered/requested item summary with links
- [ ] participant cards/profile links
- [ ] progress/checklist clarity
- [ ] deal messages still send successfully
- [ ] message errors/success messages remain visible
- [ ] confirmation CTA still submits correctly
- [ ] one-side-confirmed waiting state remains correct
- [ ] completed review submit still works
- [ ] previously submitted review state still renders
- [ ] report deal link remains available
- [ ] mobile layout sanity
- [ ] desktop layout sanity
- [ ] build passes

## Phase 33 — Story Items + Drops QA
- [ ] story label appears only on story-rich items
- [ ] no story label on empty-story items
- [ ] /drops loads with featured items
- [ ] /drops loads with published drops
- [ ] drop card items link correctly
- [ ] home CTA/section appears only when curated content exists
- [ ] site header route link to /drops works

## Navigation Active-State Edge Cases
- [ ] `/items` keeps السوق active.
- [ ] `/items/[id]` keeps السوق active.
- [ ] `/items/new` keeps اعرض active.
- [ ] `/notifications` keeps الإشعارات active.
- [ ] `/dashboard` keeps حسابي active.
- [ ] `/profile` keeps حسابي active.
- [ ] `/offers/[offerId]` keeps حسابي active.
- [ ] `/deals/[dealId]` keeps حسابي active.
- [ ] `/offers/new` does NOT incorrectly mark حسابي active.
- [ ] unread badge still caps at `9+`.
- [ ] `npm run build` passes.
- [ ] admin drops page blocks non-admins
- [ ] admin can feature/unfeature story item
- [ ] admin can create/update draft/published drop
- [ ] admin can attach/remove item from drop
- [ ] published drops visible publicly, drafts not visible publicly
- [ ] build passes

## Phase 34 — Trust Badges 2.0
- [ ] review form still submits with only rating/comment
- [ ] review form submits with one or more trust signals
- [ ] review duplicate protection unchanged
- [ ] trust signal columns persist on reviews
- [ ] profile shows beta member badge
- [ ] completed swapper badge appears only when applicable
- [ ] trait badges appear after endorsement(s)
- [ ] trait badges do not appear without endorsements
- [ ] owner trust card shows compact badge preview
- [ ] average rating and latest reviews still render
- [ ] build passes

## Phase 35 — App Feel 2.0
- [ ] bottom nav still only appears for logged-in users
- [ ] unread notification badge unchanged and still caps at 9+
- [ ] active bottom nav state changes correctly by route
- [ ] publish nav action still opens /items/new
- [ ] install card appears only when install prompt is available
- [ ] install card hides after dismiss/install
- [ ] install card does not show in standalone mode
- [ ] app/loading.tsx improved and route-level loading files compile
- [ ] /offline page renders upgraded state
- [ ] deals empty state uses upgraded EmptyState
- [ ] dashboard items empty state uses upgraded EmptyState
- [ ] drops empty state still works
- [ ] no mobile overlap with bottom nav
- [ ] build passes

## Offer Detail 2.1 — Decision Panel + Visual Timeline
- [ ] pending receiver sees decision panel (not four full forms at once)
- [ ] thinking receiver sees decision panel
- [ ] sender does not see response decision panel
- [ ] accept response still submits through existing action
- [ ] thinking response still submits note through existing action
- [ ] soft reject still submits optional note
- [ ] redirect still requires redirect type and submits correctly
- [ ] success/error query alerts still appear
- [ ] visual timeline renders existing events in chronological order
- [ ] parent-follow-up offer context still appears
- [ ] accepted offer still links to deal room
- [ ] build passes


## AB. Smart Logged-in Home
- [ ] logged-out home unchanged
- [ ] logged-in user with pending/thinking received offers sees offer priority card
- [ ] pending deal confirmation priority appears only when no offer-attention state exists
- [ ] incomplete profile priority appears only when no higher-priority transaction action exists
- [ ] no active items priority appears only when no higher-priority state exists
- [ ] fallback welcome state appears when no attention state applies
- [ ] priority CTA links route correctly
- [ ] story/drops card still appears conditionally
- [ ] PWA install card still works
- [ ] `npm run build` passes

## AB. Post-Season-2 Polish — Notification Timeline Pass
- [ ] all filter still works
- [ ] unread filter still works
- [ ] unread notifications visually distinct from read ones
- [ ] all current notification types map to a valid icon/tone
- [ ] target links still route deal > offer > item correctly
- [ ] mark one as read still works
- [ ] mark all as read still works
- [ ] empty all state still works
- [ ] empty unread state still works
- [ ] optional date grouping, if implemented, renders in correct order
- [ ] build passes

## AB. Dashboard / Account Hub 2.0
- [ ] dashboard auth redirect unchanged
- [ ] attention section appears when offers/deals/notifications need attention
- [ ] empty attention state appears when nothing is urgent
- [ ] swap activity cards show existing metrics correctly
- [ ] profile card shows username/incomplete state correctly
- [ ] public profile link appears only when username exists (if shown)
- [ ] utility/support links still route correctly
- [ ] admin review link still appears only for admins
- [ ] install CTA still available
- [ ] build passes

## Teswa Brand Rename QA
- [ ] Header uses Teswa/Teswa Arabic logo asset, not Baddelha asset
- [ ] Header subtitle uses "حاجتك لسه لها قيمة."
- [ ] Footer shows updated Teswa brand line
- [ ] Global page title/template use "تِسوى"
- [ ] OpenGraph/application/apple metadata use "تِسوى"
- [ ] Manifest name and short_name use "تِسوى"
- [ ] Home logged-out hero uses Teswa naming and new brand line
- [ ] Logged-in greeting fallback uses "تِسوى"
- [ ] PWA install card says "ثبّت تِسوى"
- [ ] Install page says "نزّل تِسوى"
- [ ] No user-facing "بدّلها" / "Baddelha" references remain in app UI
- [ ] Existing routes/business logic remain unchanged
- [ ] `npm run build` passes


## Phase 36 — Auth-First Entry + Guided Onboarding QA
- [ ] Logged-out `/` shows Teswa auth-first hero, not the previous multi-CTA lead.
- [ ] Primary CTA says "ابدأ وسجّل".
- [ ] Primary CTA routes to `/login?next=/items/new`.
- [ ] Secondary CTA "شوف السوق" still routes to `/items`.
- [ ] Optional learn-more link routes correctly if implemented.
- [ ] Login page keeps Google + email auth actions unchanged.
- [ ] Login copy matches Teswa onboarding direction.
- [ ] New user auth callback still redirects to `/profile/setup?next=/items/new`.
- [ ] Profile setup keeps existing validation and redirect behavior.
- [ ] Profile setup copy clearly frames onboarding step 1.
- [ ] Completing profile setup with next `/items/new` reaches item publish.
- [ ] Logged-in user with incomplete profile or no active item sees onboarding checklist only when no higher-priority transactional state exists.
- [ ] Logged-in user with offers/deal priorities is not distracted by onboarding checklist if scope says so.
- [ ] `npm run build` passes.

## AB. Season 3 Phase 37 — People Directory / Profiles Discovery
- [ ] `/people` loads publicly while logged out.
- [ ] directory only shows profiles with public usernames.
- [ ] each people card links to `/users/[username]`.
- [ ] card shows: display name, username, location, bio/tagline excerpt, successful swaps, active items, trust badges.
- [ ] search via `/people?q=...` matches display name.
- [ ] search via `/people?q=...` matches username.
- [ ] search via `/people?q=...` matches city/area.
- [ ] query text remains in search input.
- [ ] search empty-result state appears with recovery guidance.
- [ ] base empty-directory state appears gracefully when no data.
- [ ] logged-out home keeps auth-first hero and adds visible `/people` discovery CTA.
- [ ] logged-in home keeps transactional priority logic and adds `/people` discovery entry after priority surface.
- [ ] `/users/[username]` destination profile links work from directory cards.
- [ ] no navigation shell changes introduced.
- [ ] no DB schema changes introduced.
- [ ] `npm run build` passes.

## Season 3 Phase 38 — Messaging 2.0 QA
- [ ] `/messages` requires login and redirects logged-out users to `/login?next=/messages`.
- [ ] Inbox lists deal-based conversations and links each card to `/deals/[dealId]#messages`.
- [ ] Cards show other participant, swap context, latest message preview/timestamp, and unread badge/count.
- [ ] Ordering is by latest message activity, with fallback to accepted/created deal time.
- [ ] Opening `/deals/[dealId]` marks the thread read for that participant.
- [ ] Sending from deal room still validates in app layer and now revalidates `/messages`.
- [ ] DB blocks blank/trim-empty and >800-char message bodies.
- [ ] Dashboard and `/deals` provide clear entry to message inbox.
- [ ] No realtime behavior added yet (planned for Phase 39).

## Season 3 Phase 39 — Real-Time Messaging QA
- [ ] Open same deal in two browsers: user A sends and user B sees message appear without refresh.
- [ ] Realtime thread subscription is deal-scoped (`deal_id` filter) and does not show unrelated messages.
- [ ] Dedupe holds: send + server refresh + realtime insert/reconnect does not duplicate bubbles.
- [ ] If thread is open + visible, inbound realtime message gets marked read (unread clears in `/messages`).
- [ ] If thread tab is hidden on inbound, unread remains until tab becomes visible again (or thread reloads).
- [ ] Deal thread status copy transitions appropriately across connecting/live/degraded states.
- [ ] `/messages` inbox updates latest preview/sort after new message insert (via debounced realtime refresh).
- [ ] `/messages` unread count updates after inbound message.
- [ ] `/messages` unread state refreshes when `deal_message_reads` changes in another tab/session.
- [ ] Inbox realtime status copy transitions appropriately across reconnect/live/degraded states.
- [ ] Realtime does not expose messages outside participant scope (RLS preserved).
- [ ] No expansion to open DMs, typing indicators, read receipts UI, attachments, or presence.
- [ ] `npm run build` passes.
