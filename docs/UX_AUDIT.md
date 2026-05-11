# UX AUDIT — Phase 19

## Severity Legend
- **P0:** must fix before wider beta.
- **P1:** important polish.
- **P2:** later optimization.

## 1) First-time visitor
- **Current flow:** `/` أو `/beta` → learn → browse `/items` or login intent.
- **What works:** value proposition present, clear CTA set.
- **Friction points:** message density and CTA hierarchy can split attention.
- **Confusing moments:** difference between homepage and beta page intent is not always explicit.
- **Mobile concerns:** crowded top actions and text blocks may reduce scan speed.
- **Priority improvements:** tighten first-screen hierarchy and one primary journey (P1).

## 2) Signup/login
- **Current flow:** protected action redirects to login with `next`.
- **What works:** path continuity exists.
- **Friction points:** limited guidance when auth fails/returns unexpectedly.
- **Confusing moments:** user may not know if profile setup is next mandatory step.
- **Mobile concerns:** return-to behavior should stay predictable after browser/app switch.
- **Priority improvements:** clearer post-login progress messaging (P1).

## 3) First-time profile setup
- **Current flow:** first login → profile completion.
- **What works:** mandatory foundation before deeper participation.
- **Friction points:** perceived form effort early in journey.
- **Confusing moments:** unclear which fields are critical vs optional.
- **Mobile concerns:** keyboard/form ergonomics likely acceptable but needs repeated QA.
- **Priority improvements:** reduce cognitive load with clearer field grouping (P1).

## 4) Publishing first item
- **Current flow:** `/items/new` long form + upload + publish.
- **What works:** clear constraints and validation guidance.
- **Friction points:** long form depth for first-time user.
- **Confusing moments:** desire fields and wanted tags can feel abstract.
- **Mobile concerns:** multi-image upload reliability and HEIC pain point.
- **Priority improvements:** staged form pattern + stronger helper copy (P0 for upload reliability, P1 UX flow).

## 5) Browsing/searching marketplace
- **Current flow:** `/items` + filters/sort/search.
- **What works:** foundational discovery controls exist.
- **Friction points:** relevance and filter feedback can be improved.
- **Confusing moments:** empty-state pathways include mixed destinations.
- **Mobile concerns:** filter controls must remain fast and readable.
- **Priority improvements:** clearer active-filter summary and smarter empty-state actions (P1).

## 6) Viewing an item
- **Current flow:** `/items/[itemId]` details + owner + share + offer CTA.
- **What works:** trust/context blocks are present.
- **Friction points:** action hierarchy competes (share/report/offer/info).
- **Confusing moments:** archived/availability boundaries may surprise returning users.
- **Mobile concerns:** vertical section ordering impacts conversion.
- **Priority improvements:** reorder for one main action and secondary trust strip (P1).

## 7) Sending an offer
- **Current flow:** `/offers/new` choose existing item OR create new quick item.
- **What works:** flexible offer pathways.
- **Friction points:** dual-path form complexity is high.
- **Confusing moments:** creating “new item as offer” also publishing to marketplace may be missed.
- **Mobile concerns:** long form + decision branching raises drop-off risk.
- **Priority improvements:** simplify branching and add explicit summary review (P0/P1).

## 8) Responding to an offer
- **Current flow:** `/offers/[offerId]` with status transitions.
- **What works:** clear status model exists.
- **Friction points:** response meaning not always obvious for non-power users.
- **Confusing moments:** redirect vs reject nuances.
- **Mobile concerns:** stacked details can bury response controls.
- **Priority improvements:** microcopy clarifying each response consequence (P1).

## 9) Accepted deal coordination
- **Current flow:** accepted offer opens deal page.
- **What works:** structured participant-only page.
- **Friction points:** next-step ownership (who does what first) can be unclear.
- **Confusing moments:** transition from offer context to deal context.
- **Mobile concerns:** action visibility around completion states.
- **Priority improvements:** explicit step tracker inside deal (P1).

## 10) Deal messages
- **Current flow:** message thread + form + report link.
- **What works:** scoped privacy + basic safety controls.
- **Friction points:** refresh-based messaging (non real-time) can feel laggy.
- **Confusing moments:** users may expect instant updates.
- **Mobile concerns:** long conversation readability and safe tap targets.
- **Priority improvements:** expectation copy and refresh cues now (P1), deeper messaging system later (P2).

## 11) Confirming completion
- **Current flow:** each side confirms, then completed state.
- **What works:** bilateral confirmation protects against false completion.
- **Friction points:** uncertainty when only one side confirms.
- **Confusing moments:** pending counterpart confirmation status visibility.
- **Mobile concerns:** confirmation controls must stay obvious near thread/actions.
- **Priority improvements:** stronger pending-state explanation (P1).

## 12) Leaving review
- **Current flow:** post-completion review per side.
- **What works:** trust loop tied to completed swaps.
- **Friction points:** motivation to leave quality feedback may be low.
- **Confusing moments:** whether edit/retry is possible after submission.
- **Mobile concerns:** short-form bias can reduce review quality.
- **Priority improvements:** better prompts/templates for useful review text (P2).

## 13) Reporting unsafe behavior
- **Current flow:** `/report` with contextual targets + reasons.
- **What works:** unified report entry with constraints.
- **Friction points:** reason taxonomy could be clearer by context.
- **Confusing moments:** what happens after submission.
- **Mobile concerns:** details text area usability is fine but can be tiring.
- **Priority improvements:** post-submit expectation copy and status transparency (P1).

## 14) Admin reviewing reports
- **Current flow:** `/admin/reports` filter + status update.
- **What works:** minimum viable moderation review queue exists.
- **Friction points:** no case notes/history trail.
- **Confusing moments:** resolution consistency across admins over time.
- **Mobile concerns:** dense admin view not optimized for mobile (acceptable for admin-only).
- **Priority improvements:** add admin notes/status history model in future (P1/P2 via Phase 24).

## 15) Notifications
- **Current flow:** unread badges + `/notifications` list/actions.
- **What works:** core retention signal loop is active.
- **Friction points:** notification prioritization is basic.
- **Confusing moments:** some entries may feel generic if target context is missing.
- **Mobile concerns:** list density and quick-action ergonomics need tuning.
- **Priority improvements:** grouping and richer type-specific copy (P1).

## 16) Installing PWA
- **Current flow:** `/install` manual instructions.
- **What works:** clear platform-specific steps.
- **Friction points:** install discoverability depends on user intent.
- **Confusing moments:** “app-like” expectations vs actual push/offline limitations.
- **Mobile concerns:** browser differences can cause support friction.
- **Priority improvements:** clearer limitations and troubleshooting snippets (P2).

## 17) Sharing/beta entry
- **Current flow:** share actions + `/beta` campaign page.
- **What works:** native share + copy fallback.
- **Friction points:** shared preview expression is functionally correct but weak brand-wise.
- **Confusing moments:** invitee path from share to first action can be tighter.
- **Mobile concerns:** native share availability varies by browser.
- **Priority improvements:** stronger branded previews + “what to do first” landing direction (P1).
