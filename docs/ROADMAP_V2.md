# ROADMAP V2 — Post-Phase 19

## Phase 20 — Brand Identity System
**Goal:** Make بدّلها feel like a real, memorable brand.

**Deliverables**
- Brand tokens
- Logo direction/rules
- Color system
- Typography hierarchy
- Tone guide
- Slogan hierarchy
- UI personality principles
- Social preview style

## Phase 21 — UI Design System: reusable primitives + light application across key product surfaces. — UI Design System
**Goal:** Unify all screens visually and structurally.

**Deliverables**
- Buttons
- Cards
- Forms
- Badges
- Alerts
- Empty states
- App layout rules
- Mobile nav rules

## Phase 22 — Core UX Flow Elevation
**Goal:** Improve the most critical end-to-end journeys.

**Deliverables**
- Home/beta entry optimization
- Publish item flow simplification
- Item detail + offer CTA hierarchy
- Offer response clarity
- Deal page/messages/completion flow polish
- Review flow clarity
- Notification comprehension

## Phase 23 — Scale / Reliability / Monitoring
**Goal:** Make beta technically safer and more observable.

**Deliverables**
- Monitoring checklist + ownership
- Rate-limit coverage expansion
- Image upload hardening
- RLS tightening review
- Backup/runbook
- Slow query review process

## Phase 24 — Admin Operations
**Goal:** Make platform operations manageable as beta grows.

**Deliverables**
- Better admin reports tooling
- Feedback center
- Admin notes/status history
- Moderation action planning (without over-automation)

## Phase 25 — Closed Beta Launch
**Goal:** Invite real users in controlled waves and learn fast.

**Deliverables**
- Beta user script and onboarding pattern
- 10 → 25 → 50 rollout plan
- Feedback form/process
- Bug triage process
- Launch checklist gates

## What NOT to Build Yet
- Payments
- Delivery
- AI matching
- Public leaderboard
- Rewards/referrals
- Complex moderation automation


**Phase 20 Update (May 11, 2026):** Phase 20 formalizes brand identity tokens, copy system, and initial brand assets.
**Phase 21B Update (May 11, 2026):** Phase 21B expanded design-system adoption across core product surfaces.

- Phase 21C completed transaction-surface UI adoption.


- Phase 21D completed UI-system adoption across item/deal/profile/report transaction surfaces.

**Phase 22A Update (May 11, 2026):** Redirected offers now have a complete follow-up loop (`/offers/new?fromOffer=<id>`), linked by `parent_offer_id` with app+DB duplicate/safety guards.


**Phase 22B Update (May 11, 2026):** Core UX flow elevation: first-time entry, publish, offer, deal, review, report, notifications.

**Phase 22C Update (May 11, 2026):** Phase 22C clarified offer responses, redirected follow-ups, deal steps, messages, completion, reviews, and reports.


## Phase 23 update
Phase 23 added operations runbooks, smoke testing, admin ops snapshot, and health check.


## Phase 24 update
Phase 24 added a controlled-beta feedback center (`/feedback`, `/dashboard/feedback`) and admin review workflow (`/admin/feedback`) with RLS + aggregate ops visibility.

**Phase 25 Update (May 12, 2026):** Closed beta launch kit added (launch plan, invite scripts, pre-send checklist, triage guide, and manual tracking templates) with stop/expand gates for 10 → 25 → 50 rollout.

## Season 2 Pointer
After closed beta readiness and final logo installation, Season 2 focuses on premium product evolution: Profile 2.0, Publish Item 2.0, Item Detail 2.0, Deal Room 2.0, Story Items, Creator Drops, Trust Badges, and App Feel 2.0.
See: `docs/SEASON_2_ROADMAP.md`.
