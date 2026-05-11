# MASTER PRODUCT MAP — Phase 19

## A) Product Definition
- **What بدّلها is:** منصة مقايضة عربية أولًا تركز على تبادل الحاجات غير المستخدمة بين أشخاص حقيقيين بشكل عملي وآمن نسبيًا.
- **Core one-liner:** **"بدّل الحاجة بدل ما تسيبها مركونة."**
- **Product category:** Arabic-first swap marketplace / social exchange platform.
- **Current stage:** Controlled beta MVP.

## B) Core User Roles
- **Guest:** يتصفح الصفحات العامة (الرئيسية، السوق، الإعلانات العامة، البروفايلات العامة، بيتا، الأمان، التثبيت).
- **Logged-in user:** يقدر يدير حسابه، يعرض حاجات، يرسل عروض، يتابع الإشعارات.
- **Item owner:** ينشر إعلان، يستقبل عروض، يرد عليها، ويكمّل الصفقة لو قبل.
- **Offer sender:** يختار حاجة من عنده/ينشئ حاجة جديدة ويبعث عرض.
- **Deal participant:** ينسّق التفاصيل داخل صفحة الصفقة، يرسل رسائل، يؤكد الإتمام، ويكتب تقييم.
- **Admin:** يراجع البلاغات ويغير حالتها من `/admin/reports`.

## C) Core Product Loops
1. **Discovery loop:** `/` → `/items` → `/items/[itemId]` → `/offers/new`
2. **Supply loop:** login → profile setup → `/items/new` → incoming offers
3. **Offer loop:** send offer → owner response (thinking/accept/reject/redirect)
4. **Deal loop:** accepted offer → `/deals/[dealId]` → messages → completion confirmation → review
5. **Safety loop:** `/report` submission → user follow-up → admin review on `/admin/reports`
6. **Retention loop:** `/notifications` → `/dashboard` → deals/offers/messages follow-through
7. **Growth loop:** share item/profile/beta links → new user enters

## D) Current Platform Capabilities (Implemented)
- Google auth + gated protected routes.
- Profile setup/edit + public profile pages.
- Item publishing/editing lifecycle including archive/reactivate.
- Multi-image upload to Supabase Storage with constraints.
- Marketplace search/filter/sort.
- Item detail with owner info + share actions.
- Offer creation, status transitions, and timeline events.
- Deal creation from accepted offers.
- Deal coordination page + deal-scoped messaging.
- Message reporting + basic message rate-limiting.
- Two-sided completion confirmations.
- Post-completion reviews shown on public profiles.
- Reporting against item/profile/offer/deal/message.
- Admin reports review/status update surface.
- Notifications center + mark read / mark all read.
- PWA manifest/service worker + conservative offline fallback.
- Public beta landing + share/copy actions.

## E) Current Product Maturity by Area
- **Auth & access control:** Good but needs polish.
- **Profiles & trust signals:** Good but needs polish.
- **Item publishing & browse:** Good but needs polish.
- **Offers lifecycle:** MVP only.
- **Deals + completion + reviews:** MVP only.
- **Deal messaging safety:** MVP only.
- **Reporting/admin moderation baseline:** Good but needs polish.
- **Notifications:** MVP only.
- **PWA/install/offline:** MVP only.
- **Brand identity system:** Missing.
- **Design system consistency:** Risk area.
- **Observability / monitoring depth:** Risk area.
- **Automated test coverage:** Missing.

## F) Top 10 Next Priorities (Ranked)
1. Define and apply brand identity foundation (Phase 20).
2. Establish UI design system and shared component language (Phase 21).
3. Remove highest-friction UX points in publish/offer/deal flows (Phase 22).
4. Expand technical monitoring + incident response playbook (Phase 23).
5. Tighten privacy-sensitive policies (offers / offer_events review) (Phase 23).
6. Harden image pipeline (mobile formats, guidance, failure handling) (Phase 23).
7. Strengthen anti-abuse controls beyond message-level throttling (Phase 23/24).
8. Upgrade admin operations workflow (status history, triage hygiene) (Phase 24).
9. Prepare staged closed beta operations (10→25→50 users) (Phase 25).
10. Add basic repeatable smoke/regression checks before each release (Phase 23/25).
