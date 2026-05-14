# TESWA Data Safety Worksheet (GP-02)

## 1) Scope note
This is an **engineering worksheet** to support Google Play Data Safety form completion. It reflects current observed product behavior and must be finalized by a human owner during Play Console submission.

## 2) Data categories likely involved

### A) Personal info
- Email/account login identifier
- Display name / username

### B) User-generated content
- Profile content (bio, tagline, interests, preferences, city/area text)
- Item listings (title, category, condition notes, story, swap reason, good_for, desired exchange framing)
- Images (avatar/cover/item images)
- Proposals/offers
- Messages inside deal/coordination rooms
- Reviews, feedback, and reports

### C) Location-like data (user-entered)
- City / area text entered by users in profile/listing flows
- Note: this is currently treated as **user-provided textual location context**, not necessarily device GPS collection

## 3) Category-by-category worksheet

| Category | Where it appears | User-provided? | Public vs private behavior | Likely purpose | Confirmation needed? |
|---|---|---|---|---|---|
| Email / auth-linked account data | Auth/login flows | Yes (or provider-linked) | Private by default | Account management, login, security | Confirm exact Play Console mapping |
| Display name / username | Profile setup and display | Yes | Often public when profile is public | App functionality, identity/trust | Confirm retention wording |
| Profile fields (bio, interests, preferences, city/area) | Profile edit and profile pages | Yes | Public where user publishes profile | App functionality, matching context | Confirm final visibility wording |
| Item listing content + images | Publish/edit item flows and item pages | Yes | Public when published | Core functionality | Confirm moderation handling details |
| Proposals + coordination/deal messages | Offer/proposal and deal-room flows | Yes | Private to involved participants by default | App functionality, coordination, safety traceability | Confirm Data Safety category labels |
| Reviews/feedback/reports | Post-deal and feedback/report surfaces | Yes | Reviews may be visible; reports/feedback generally operational | Trust, moderation, support | Confirm final disclosure language |
| Operational status/timestamps/IDs | Service operation state | System-generated | Operational/internal | Reliability, ordering, safety history | Confirm if exposed in policy wording |

## 4) Data sharing / service-provider note
Current architecture indicates that infrastructure providers used for hosting/auth/storage may process data as needed to operate Teswa. This worksheet does **not** claim additional data selling or ad-network sharing without explicit product/legal confirmation.

## 5) Security practice notes to confirm during submission
- Login/account controls exist via authentication flows.
- Production deployment and TWA transport are expected to rely on HTTPS.
- User rights/request channels are partially defined and require final support contact + policy finalization.
- Mark any uncertain control as: **confirm in submission**.

## 6) Data deletion / account deletion status (critical)
Repository review in GP-02 does **not** show an obvious public account-deletion flow or a dedicated deletion-request route.

**Release compliance item requiring explicit review before Play Console submission.**

Do not declare in-app account deletion as available unless implemented and verified.

## 7) Open questions requiring human/product confirmation
1. Final support email for Play Console and in-product notices.
2. Final privacy contact email (replace placeholders).
3. Final retention/deletion wording for policy and Data Safety consistency.
4. Whether an account deletion flow/page will be implemented before submission.
5. Whether any analytics/crash tooling is introduced before release.
6. Final vendor disclosure wording for hosting/auth/storage operations.
