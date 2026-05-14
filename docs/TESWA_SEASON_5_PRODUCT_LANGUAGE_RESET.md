# Teswa Season 5 — Product Language & Data Meaning Reset (Phase 52)

## 1) Why Season 5 exists
Season 4 made Teswa stronger in UI quality, polish, and conversion clarity. Season 5 exists to protect product identity: Teswa should not drift into a generic marketplace that only looks premium. This reset re-centers Teswa on curiosity, reinterpretation of value, and human surprise.

## 2) Teswa internal definition
**تِسوى مساحة تخلّي الناس تعرض الحاجات اللي خرجت من حياتهم، وتشوف قيمتها وهي بتتغيّر في عيون ناس تانية — من خلال فضول، عروض، حكايات، ومقايضات ممكن تكون منطقية أو غريبة بشكل ممتع.**

Teswa does not start from “what do I want to buy/find?”. It starts from “what could this thing become worth for someone else?”.

## 3) Core thesis
- **Possibility-first, Exchange-enabled.**
- Curiosity first, utility second.
- Barter is the mechanism, not the whole identity.
- Stories and reinterpretation of value are not decoration; they are part of the product core.

## 4) What Teswa is NOT
Teswa is not:
- a generic barter marketplace,
- a used-goods catalog,
- a classifieds product with prettier UI,
- a product whose full value is just “search → filter → transact”.

## 5) Marketplace mindset audit
| Current Marketplace-Framed Concept | Why It Is Wrong for Teswa | Season 5 Direction |
| --- | --- | --- |
| condition | Sounds like resale valuation grades | A transparency layer: what must be said clearly |
| search | Assumes users already know exactly what they want | Discovery of possibilities and unexpected fit |
| sort oldest/title | Exposes database mechanics in frontstage UX | Later shift to curiosity/activity/value-oriented ordering |
| category-first browse | Reinforces catalog behavior | Discovery worlds first, category utility later |
| ad/listing language | Pulls identity toward classifieds | Thing / value / possibility language |
| offer as transaction | Too procedural and price-like | “What I think this is worth to me” |

## 6) Data meaning reset
Phase 52 intentionally preserves all stored enum values and contracts:
- `condition`: `almost_new`, `good_used`, `minor_issues`, `needs_repair`
- `desire_mode`: `specific`, `flexible`, `surprise`

In this phase, we reframe **UI meaning** (labels/helpers) without changing:
- database values,
- schema,
- server action contracts,
- form field names,
- validation or business logic.

Any deeper data model reshaping is a later product decision.

## 7) Phase 52 exact implementation scope
- Create centralized, typed language constants for `condition` and `desire_mode`.
- Reset condition language from valuation framing to transparency framing.
- Reset desire mode language from filter-like asks to openness/possibility framing.
- Clean selected publish-flow copy from classifieds language.
- Apply language layer to high-impact surfaces (publish form, item detail, offer new-item flow, condition filter labels).
- No feed/search structural redesign yet.

## 8) Deferrals to upcoming Season 5 phases
- **Phase 53:** Possibility Feed / New Home
- **Phase 54:** Explore Rebuild Beyond Marketplace Search
- **Phase 55:** Publish Flow Reframe
- **Phase 56:** Thing Card & Value Question Page
- **Phase 57:** Offer Reframe

## Known Legacy Vocabulary Still Present (intentional in Phase 52)
The following are known and deferred, not forgotten:
- “إعلان” wording in some public/account surfaces,
- marketplace search framing,
- sort labels such as الأحدث / الأقدم / العنوان,
- category-first browse behavior,
- transactional offer CTA phrasing in some flows.

These will be handled intentionally in later phases, especially Phase 54, Phase 56, and Phase 57, rather than through risky repo-wide find/replace.

## 9) Phase 53 implementation note — Possibility Feed / New Home
- Home is now the first concrete expression of the reset: a **Possibility Feed** front door, not a marketplace explainer and not a task dashboard.
- Logged-in urgency logic (offers, pending completion, profile completion, first active item) is preserved, but visually demoted into a compact coordination pulse so curiosity remains the page identity.
- Home now emphasizes live possibility rails (surprise/flexible openness, story-rich items, curiosity prompt framing) using existing active-item data only.
- Explore structural overhaul and broader discovery architecture remain intentionally deferred to **Phase 54**.

## Phase 54 implementation note — Explore Beyond Marketplace Search
- `/items` is now framed as an Explore surface led by discovery worlds first, rather than category/search-first marketplace behavior.
- Search is still available and useful, but intentionally moved to a secondary narrowing section.
- Category filtering still exists for utility, but it no longer defines the first discovery layer.
- Visible sort controls were removed from Explore UI; legacy `sort` params are still parsed for backward compatibility.
- Global Thing Card and Value Question reframing remains deferred to **Phase 56**.

## Phase 55 implementation note — Publish Flow Reframe
- Publish now presents as opening a value question for a thing that left your life, not creating a listing.
- The 6-step flow now guides from visibility and naming to truth, story, offer openness, then review-before-release.
- `condition` and `desire_mode` now use expressive choice cards powered by centralized Teswa language, with enum values unchanged.
- Backend/server action contracts, field names, and persistence behavior remain unchanged.
- Item-edit vocabulary parity is intentionally deferred to a later consistency phase.

## Phase 56 implementation note — Thing Card & Value Question Page
- Explore cards now read as **Possibility Cards** that foreground openness, story spark, and why the thing is interesting, instead of listing-summary behavior.
- The public thing page now frames each item as a **value question** with clearer invitation language around “what this is worth to me.”
- Transparency (`condition`) remains visible and explicit, but is treated as a truth layer rather than the primary curiosity hook.
- Detail-page offer CTA and support copy were reframed to Season 5 language, while the full Offer Composer rewrite remains deferred to **Phase 57**.
- No backend, schema, route, or data-contract changes were introduced in this phase.

## Phase 57 implementation note — Offer Reframe
- Offer creation now reads as answering a value question, not submitting a generic swap transaction.
- New-offer page, composer, and review block now frame the user’s item as their interpretation of value.
- Offer detail and response surfaces now use proposal language while preserving offer/deal status logic.
- Inline new-item offer mode now uses expressive meaning controls for `condition` and `desire_mode` without changing enum values.
- Broken `/feed` usage in offer detail was removed in favor of a valid explore route.
- Backend actions, schema, and status contracts remain unchanged.

## Phase 58 implementation note — Public Motion of Value
- `/drops` now acts as the first public motion hub instead of a curation-only page identity.
- It combines three safe public layers: active things already receiving proposals through `offer_count`, story-led featured items, and curated creator drops.
- Home now links to this broader motion layer, not only story/drop curation.
- Offer details and deal details remain private; this phase surfaces movement, not private content.
- No schema, backend contracts, or status-model changes were introduced.


## Phase 59 implementation note — People as Exchange Personalities
- `/people` now introduces people as personalities with different ways of opening value, not just a directory of accounts.
- Directory cards foreground style/personality line and “open doors” more than raw account summary.
- Public profiles now frame interests/preferences as a visible exchange personality layer.
- Trust and reviews remain intact, but they support the personality rather than define the whole page.
- No social graph, schema, ranking, or privacy changes were introduced.

## Phase 60 implementation note — Integration & Concept Audit

Phase 60 aligned navigation, dashboard/account surfaces, notifications, and static public explanatory copy with the Season 5 doctrine. Navigation now uses **"استكشف"** instead of market framing, and proposal language consistency ("اقتراحات") was extended across account/system surfaces and explanatory pages. A final drift audit was run for broken `/feed` usage and recurring invalid legacy token/class patterns. With this closure pass, Season 5 language integration is complete.
