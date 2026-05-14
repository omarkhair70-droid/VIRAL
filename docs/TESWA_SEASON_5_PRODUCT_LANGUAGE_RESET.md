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
