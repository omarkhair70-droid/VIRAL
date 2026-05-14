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

## 12) Phase 42B — Product Feel Primitives & Advanced Foundation

### Upload System
- `AvatarUpload`: profile photo upload with empty/preview states, helper/error text, disabled/uploading support.
- `CoverUpload`: wide banner upload with empty/preview states and helper/error support.
- `MediaUploadBlock`: reusable item/gallery upload container for helper/error messaging and consistent mobile tap shape.
- Rule: preserve current upload/storage/business logic; only replace UI shell around existing file input flow.

### Trust / Badge / Stat System
- `Badge` tones: `neutral`, `accent`, `positive`, `warning`, `danger`, `info`, `meta`.
- `StatusPill`: status signal primitive (pending/active/completed/archived/read states mapped by caller).
- `TrustChip`: compact trust-language chip for verification/completion/credibility cues.
- `MetricPill`: compact numeric summary primitive.
- `CountBadge`: compact unread/count signal with 99+ cap.
- Anti-badge-soup rule: prefer 1–3 strong signals over many weak tags.

### Product State Components
- Shared state family (`EmptyState`, `LoadingState`, `ErrorState`, `SuccessState`, `InfoState`, `ProcessingState`) built on `StateBlock`.
- Supports title/body + optional primary/secondary actions.
- Compact vs hero usage guidance: compact inside cards/lists, hero for full-page task moments.

### Media / Gallery Foundation
- `MediaFrame`: ratio-safe media container (`square`, `portrait`, `wide`, `hero`) with object-fit behavior.
- `MediaFallback`: intentional fallback slot through `fallback` prop.
- `GalleryIndicator`: generic dot indicator for image position/count.
- `MediaSkeleton`: loading media placeholder aligned with reduced-motion safety.
- These primitives are the base for Phase 44/45 gallery-first card/detail work.

### Focused Flow Chrome Guidance
- `FocusedFlowShell` is available as an inner composition primitive for future focused pages/steps.
- Phase 42B does **not** enable true global shell suppression (root `app/layout.tsx` chrome is unchanged).
- Real suppression of global header/footer/mobile nav requires a dedicated future layout-architecture pass when a true focused route is introduced.

### Motion / Interaction Foundation
- Subtle transitions on upload/media/state primitives.
- Skeleton pulse includes `motion-reduce` safety.
- Interaction feedback focuses on clarity (tap/hover/focus), no decorative animation.

### Explicit 42B Non-goals
- No route-wide redesigns.
- No backend/business-logic/schema/storage changes.
- No forced migration of large route groups.

### Guidance for Phases 43–45
- **Phase 43**: consume state/trust/upload primitives in targeted route touch-ups.
- **Phase 44**: build listing card media hierarchy via `MediaFrame`, `GalleryIndicator`, `MediaSkeleton`.
- **Phase 45**: build item-detail gallery-first layouts using the same media/upload/state primitives.

## 13) Phase 50 — Season 4 Closure Pass

### A) System state policy
- Global `loading`, `error`, and `not-found` screens must use the same Warm Editorial surface hierarchy as core flows.
- State pages keep original meaning/behavior contracts (error reset, safe market return paths) while upgrading feel.
- `AppLoadingState` remains the default loading bridge and preserves its prop API.
- Bridge states (like `EmptyState`) remain compatibility-safe for legacy/utility routes.

### B) Motion policy
- Motion is clarity-first: subtle hover/tap response and clear focus-visible states.
- Interaction motion should be short and calm, never decorative.
- Reduced-motion support is mandatory for transforms/transitions and ongoing animations where feasible.

### C) Shared bridge primitives (compatibility role)
- `EmptyState`, `Alert`, `PageHeading`, and `ImageFrame` are maintained as API-stable bridges.
- They should follow Season 4 tokens/surfaces internally while keeping existing props and call-site compatibility.
- New work should prefer Season 4 primitives, but bridge components remain valid for gradual migration.

### D) Shell polish policy
- Header navigation, mobile bottom navigation, and footer should match the Warm Editorial system.
- Preserve existing IA, route semantics, counts/badges, auth behavior, and active-state logic.
- Polish can include focus/hover/tap consistency and token alignment only.

### E) Final audit rule
- Do not introduce undefined typography/color/spacing utility classes.
- Explicitly avoid invalid classes such as `type-display`, `type-lead`, `type-headline`, `type-label`, standalone `text-app-text`, and `p-panel-xl`.
- Future enhancements must reuse shared tokens/primitives instead of silent one-off utility names.

### F) Season 4 completion note
- Phases 42A, 42B, and 43–50 now establish and apply the Warm Editorial Marketplace system across Teswa’s core product experience.
