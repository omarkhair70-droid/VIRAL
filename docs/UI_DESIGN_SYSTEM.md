# UI Design System — بدّلها

## A) Design principles
- واضح قبل ما يكون مزخرف.
- دافي ومطمّن.
- عملي وسريع.
- محلي من غير عشوائية.
- ثقة من غير مبالغة.

## B) Visual tokens
- `sand`
- `clay`
- `clayDark`
- `ink`
- `muted`
- `cream`
- `warmBorder`
- `successSoft`
- `warningSoft`
- `dangerSoft`

## C) Component rules
- **Buttons:** primary for one main action, secondary for supporting action, quiet/ghost for low-emphasis links, danger only for destructive actions.
- **Cards:** rounded-2xl, warm border, white/cream surfaces, comfortable spacing.
- **Badges/Status pills:** compact pill shape, semantic tone only.
- **Alerts:** short feedback with clear variant (`info/success/warning/danger`).
- **Empty states:** always contain useful guidance and at least one next step.
- **Page headings:** clear title + optional eyebrow/subtitle/actions.
- **Forms:** readable spacing, clear labels, no cramped stacking on mobile.
- **Data/action cards:** consistent spacing and CTA hierarchy.
- **Admin cards:** plain and functional; no decorative overload.

## D) Usage rules
- Primary action per section should be obvious.
- Secondary actions should be quieter.
- Destructive/safety actions should not look like primary CTAs.
- Empty states should always guide to one useful next action.
- Admin UI should stay functional and plain.
- Arabic text should breathe; avoid cramped layouts.

## E) What not to do
- No flashy marketplace style.
- No corporate SaaS blue look.
- No childish playful UI.
- No fake urgency.
- No overloaded CTAs.

## F) Adoption status
- **Phase 21 (completed):** Home and Marketplace migrated to shared UI primitives.
- **Phase 21B (completed):** Core app surfaces migrated (account hub, item detail, deals, notifications, reports, and admin reports) to shared primitives without behavior changes.
- **Remaining migration candidates:** low-priority static/support pages and any legacy isolated components not yet touched in core flows.
