# TESWA Data Safety Worksheet (GP-05 expanded prep draft)

## 1) Scope and legal caution
This is an engineering/operations worksheet to prepare Play Console Data Safety answers. It is **not** a final legal declaration and must be confirmed by the release owner before submission.

## 2) Alignment requirements to remember
- Data Safety declarations must align with the live Privacy Policy: `https://viral-one-delta.vercel.app/privacy`.
- Data Safety form is required for **closed**, **open**, and **production** tracks.
- Internal testing-only track is exempt from Data Safety requirement.

## 3) Deletion-request compliance snapshot
- Public deletion-request route exists: `/account-deletion`
- In-app authenticated deletion-request route exists: `/profile/delete-account`
- Requests are collected for operational handling; this worksheet does not claim instant destructive deletion.

## 4) Draft data mapping matrix (for manual Play Console completion)

| Collected data type | Example fields | User-provided or system-generated | Public/private handling (likely) | Likely purpose | Likely Play Console category | Human confirmation required? |
|---|---|---|---|---|---|---|
| Account/auth info | Email/account identifier, auth provider ID | Mixed | Mostly private, some account identity context | Authentication, account management, abuse prevention | Personal info / App activity (final mapping manual) | Yes |
| Profile info | Display name, username, profile image, bio/preferences | Mostly user-provided | Public profile surfaces + private account controls | Identity presentation, trust/discovery | Personal info / Profile | Yes |
| User-generated listing content | Item title, description, photos, condition/context | User-provided | Public when user publishes | Core app functionality and discovery | Photos/Video, App activity, user content | Yes |
| Proposals/offers | Offer text, negotiation context, timestamps | User-provided + system timestamps | Private between participants | Core exchange coordination | Messages / App activity | Yes |
| Direct messages/coordination | Message body, delivery/read metadata | Mixed | Private between participants | Coordination and communication | Messages | Yes |
| Ratings/reviews/reports | Rating value, review text, report reason | User-provided + system metadata | Mixed by feature and moderation policy | Trust, safety, moderation | App activity / User content | Yes |
| Location-like text | City/area entered by users | User-provided | Visibility depends on feature surface | Discovery relevance and context | Location (user provided coarse text) | Yes |
| Account deletion request data | Email, username, request notes/source, timestamps, status | Mixed | Operational/private | User rights request handling and compliance operations | Personal info / Customer support operations | Yes |

## 5) Notes for final console entry
- Avoid over-claiming data sharing behavior unless explicitly confirmed.
- Avoid over-claiming encryption scope/details unless technically and legally confirmed.
- Final entries must reflect actual product behavior at submission time, including moderation and support workflows.
