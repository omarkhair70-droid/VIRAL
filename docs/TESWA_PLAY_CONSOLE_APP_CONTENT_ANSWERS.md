# TESWA Play Console App Content Answers (GP-05 draft)

> This document is a submission-prep draft for Play Console. Final legal/policy confirmations remain manual.

## 1) Privacy policy
- **URL:** `https://viral-one-delta.vercel.app/privacy`
- Current status:
  - Active public privacy route exists.
  - Account deletion handling exists separately through public and in-app flows.

## 2) Ads
- **Recommended current answer:** No (if there are no ad SDKs, no banners, no interstitials, no native ads, and no house ads).
- This recommendation is based on current product/code posture and must be re-checked if monetization or ad tooling changes later.

## 3) App access
- Public browsing exists without login.
- Some core actions require authentication:
  - publishing
  - sending proposals
  - messaging
  - profile management

**Recommended disclosure text for Play Console:**
> The app includes public browsing without login. Publishing items, sending proposals, profile editing, and messaging require authentication through Google sign-in or email magic link.

- If reviewers need access to logged-in functionality, a reviewer-access plan is required.
- Credential and review-path strategy is defined in `docs/TESWA_REVIEWER_ACCESS_STRATEGY.md`.

## 4) Target audience and content
- Recommended preliminary direction: General audience; not specifically designed for children.
- Final Play Console audience selection must follow final business intent.
- Do not select children-focused targeting unless the product is intentionally designed for that audience.

## 5) Content rating guidance
- Complete the questionnaire truthfully.
- Teswa is a social/exchange coordination app, not a game.
- By design, likely no violence/gambling/sexual-content focus, but user-generated content exists; answer carefully where community/UGC behaviors are asked.

## 6) Data Safety
- Use: `docs/TESWA_DATA_SAFETY_WORKSHEET.md` while filling the form.
- Likely data areas to map carefully:
  - account/auth information
  - profile information
  - user-generated content
  - city/area text entered by users
  - messages/proposals/reviews/reports
  - account deletion request data

Do not treat this worksheet as final legal certification; human confirmation is still required before final submission.
