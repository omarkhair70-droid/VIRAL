# Teswa UI System 2.0 (Season 4 — Phase 42A)

## 1) Purpose
Phase 42A establishes the reusable UI foundation for Season 4 without redesigning major routes.

## 2) Season 4 Direction
**Warm Editorial Marketplace**: Arabic-first, premium-but-human, app-like hierarchy, less “everything is a white card.”

## 3) Core Principles
- App-like feel over stacked web sections.
- Fewer heavy boxes; clearer surface intent.
- Stronger information hierarchy.
- Simplicity with presence.

## 4) Token Roles
- **Color**: `app.canvas`, `app.surface`, `app.soft`, `app.border`, text tiers, `app.accent`, `app.accent-hover`, `app.accent-soft`, `app.focus`, `app.danger`.
- **Radius**: `ui-xs`, `field`, `button`, `surface-compact`, `surface`, `hero`.
- **Spacing**: `page-gutter`, `stack-compact`, `stack-section`, `panel-sm/md/lg`, `row-y`, `field-gap`, `actions-gap`.
- **Typography**: `type-hero`, `type-page-title`, `type-section-title`, `type-card-title`, `type-body`, `type-support`, `type-meta`, `type-micro`, `type-numeric`.

## 5) Surface Architecture
- **HeroPanel**: intro/value framing; not for repetitive list items.
- **SurfaceCard**: primary grouped content.
- **SoftPanel**: quiet supportive content.
- **CompactRow**: dense row/list items.
- **InlineNotice**: warnings/guidance/status snippets.
- **SectionBreak**: subtle section separation.

## 6) Button/CTA Taxonomy
- Variants: `primary`, `secondary`, `outline`, `quiet`, `destructive`.
- Sizes: `compact`, `sm`, `md`, `lg`.
- Supports: `fullWidth`, `iconOnly`, disabled, `loading`.

## 7) Form System Rules
Use `FormSection` + `Field` + `Label` + `HelperText`/`ErrorText` + `TextInput`/`Textarea`/`Select` + `FormActions`.
Keep labels explicit and mobile-readable, with optional/required hints.

## 8) Mixed Arabic/Latin Notes
- Preserve readable line-height and muted contrast for metadata.
- Use neutral input typography for emails/handles/usernames.
- Avoid forced letter spacing changes that degrade Arabic rhythm.

## 9) Explicit Phase 42A Non-goals
No route redesigns, no upload/media primitives, no empty/loading state system, no trust-stat primitives, no shell behavior changes.

## 10) Phase 42B Next
Upload/media primitives, trust badges/stats, state primitives (empty/loading/error/success), and motion/interaction foundations.

## 11) Phases 43–50 Inheritance
All upcoming redesign phases should consume these shared tokens/primitives first, and avoid introducing parallel ad-hoc UI classes.
