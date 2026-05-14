# TESWA Account Deletion Request Flow (GP-02B)

## 1) Why this exists
GP-02 flagged account deletion as a compliance gap. GP-02B closes that gap before Play submission by adding explicit deletion-request intake paths.

## 2) What was implemented
- Public deletion request page: `/account-deletion`
- Authenticated in-app deletion request page: `/profile/delete-account`
- Database intake table: `public.account_deletion_requests`
- Entry points added from the public footer and the authenticated profile page

## 3) Request lifecycle
Requests are stored with operational status values:
- `pending`
- `reviewing`
- `resolved`
- `declined`

This lifecycle supports manual operational handling. No admin dashboard is added in GP-02B.

## 4) Data captured
Each request can capture:
- `email` (required)
- `username` (optional)
- `request_note` (optional)
- `request_source` (`public_web` or `authenticated_profile`)
- `created_at` / `updated_at`
- `user_id` when submitted by an authenticated user

## 5) What is NOT implemented in GP-02B
- No immediate destructive account deletion
- No admin moderation dashboard
- No automated email sending
- No auto-purge scheduler

## 6) Why request-based design was chosen
Teswa has linked user-generated content, exchange coordination, and moderation/safety history. A request-first approach is safer and release-compliant while final legal/retention SOP is finalized.

## 7) Future operator steps
- Review incoming rows in Supabase/admin tooling.
- Define exact account/data deletion execution SOP before full launch.
