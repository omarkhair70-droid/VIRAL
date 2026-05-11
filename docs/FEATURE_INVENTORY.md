# FEATURE INVENTORY — Phase 19

| Area | Feature | User-facing route/component | Status | Quality level | Risk level | Next improvement | Phase suggestion |
|---|---|---|---|---|---|---|---|
| Auth | Google login/session gating | `/login`, protected routes | Done | Medium | Medium | Better session edge-case handling + clearer auth errors | 22 |
| Profile setup | First-time profile completion | profile setup flow, `/dashboard` | Done | Medium | Medium | Reduce first-time friction and validation clarity | 22 |
| Public profiles | Public identity + trust counts/reviews | `/users/[username]` | Done | Medium | Medium | Improve trust presentation hierarchy and empty states | 21/22 |
| Item publishing | Publish/edit/archive/reactivate item | `/items/new`, item forms | Done | Medium | Medium | Streamline form complexity + progressive disclosure | 22 |
| Image upload | Multi-image upload with type/size limits | `components/item-form.tsx` | Done | Basic | High | HEIC fallback strategy + clearer mobile upload recovery | 23 |
| Marketplace search/filter | Search + category/city/condition/sort | `/items` | Done | Medium | Medium | Improve relevance and filter UX clarity | 22 |
| Item detail | Item detail + owner context + CTA | `/items/[itemId]` | Done | Medium | Medium | Sharpen CTA priorities and trust/safety signals | 22 |
| Offers | Create offer (existing item or quick new item path) | `/offers/new` | Done | Basic | High | Simplify offer creation branches and guard rails | 22 |
| Offer responses | Accept/reject/thinking/redirect | `/offers/[offerId]` | Done | Medium | Medium | Better response explanations + outcome clarity | 22 |
| Deals | Deal surface and participant privacy | `/deals`, `/deals/[dealId]` | Done | Medium | Medium | Improve timeline/next-step guidance in deal state changes | 22 |
| Deal messages | Deal-scoped messages + report + rate limit | `components/deals/*`, `/deals/[dealId]` | Done | Basic | High | Stronger abuse controls + moderation workflow depth | 23/24 |
| Completion confirmations | Two-sided completion flow | `/deals/[dealId]` | Done | Medium | Medium | Improve conflict resolution messaging (one side confirms first) | 22 |
| Reviews | Post-completion review trust loop | deal/review flow, public profile | Done | Medium | Medium | Better review quality prompts and anti-gaming checks | 22/23 |
| Reports | User reporting for unsafe/misleading behavior | `/report` | Done | Medium | Medium | Better reason taxonomy and clearer report outcomes | 24 |
| Admin reports | Admin review/update report status | `/admin/reports` | Done | Medium | Medium | Add triage notes/history and queue prioritization | 24 |
| Notifications | In-app notifications center | `/notifications`, header count | Done | Medium | Medium | Better grouping/prioritization and delivery reliability checks | 22/23 |
| PWA/install/offline | Install instructions + offline fallback | `/install`, `/offline` | Done | Basic | Medium | Validate cross-device behavior and clearer limitations | 22/23 |
| Sharing/beta | Share/copy + beta landing | `/beta`, `components/share-actions.tsx` | Done | Basic | Medium | Stronger branded social preview/copy system | 20/22 |
| Dashboard/account center | User command center | `/dashboard` | Needs polish | Medium | Medium | Better IA for deals/offers/notifications actions | 21/22 |
| Safety pages | How-it-works + safety guidance | `/safety`, `/how-it-works` | Done | Medium | Low | Align copy tone + consistent trust language system | 20/21 |
| Docs/operations | Readiness + QA + RLS docs | `docs/*.md` | Partial | Medium | Medium | Consolidate operating model + roadmap-driven docs set | 19/23 |
