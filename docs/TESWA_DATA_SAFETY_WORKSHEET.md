# TESWA Data Safety Worksheet (GP-02B update)

## 1) Scope note
This is an engineering worksheet to support Google Play Data Safety completion. Final Play Console wording still requires human/legal confirmation.

## 2) Deletion-request compliance status
- Public deletion-request route now exists: `/account-deletion`.
- In-app authenticated deletion-request route now exists: `/profile/delete-account`.
- Requests are captured for operational review; this phase does not claim instant destructive deletion.

## 3) Data categories likely involved

| Category | Data examples | Purpose | Visibility |
|---|---|---|---|
| Account/auth data | Email/account identifier, display name, username | Login, account management, trust identity | Operational; some profile fields can be public |
| User-generated content | Profile content, items, images, proposals, messages, reviews/reports/feedback | Core marketplace functionality, safety, moderation | Mixed public/private by feature |
| Location-like text | City/area entered by users | Discovery/context | User-provided text, visibility by surface |
| **Account deletion request data** | **email, username, request note, request source, timestamps** | **User rights and account deletion request processing** | **Operational/private** |

## 4) Notes
- Account deletion requests are now an explicit service-support data category.
- Infrastructure provider processing (hosting/auth/storage) still requires final human disclosure wording.
- Final mapping in Play Console (collection purpose, handling, retention language) requires release-owner confirmation.
