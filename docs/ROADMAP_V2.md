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
