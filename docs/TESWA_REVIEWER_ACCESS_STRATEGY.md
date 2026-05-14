# TESWA Reviewer Access Strategy (GP-05)

## 1) Why reviewer access matters
Google Play App access declarations must include clear instructions when all or part of app functionality is restricted by login.

## 2) Current login reality
- Public browsing routes are accessible without login.
- Core interaction flows require authentication.
- Supported login methods:
  - Google sign-in
  - Email magic link

## 3) Reviewer access options

### Option A — Public-only review claim
- Claim that reviewers only need public browsing.
- **Risk:** not recommended if Google needs to verify restricted interaction flows.

### Option B — Dedicated reviewer Google account
- Provide a prepared Google-based reviewer account path.
- **Feasibility:** possible if account provisioning and sign-in reliability are controlled before submission.

### Option C — Dedicated reviewer login method or demo-access implementation
- Implement a technical reviewer/demo access mode.
- **Quality:** strongest long-term control if repeated review cycles are expected.
- **Status in GP-05:** not implemented.

## 4) Recommended GP-06 approach
- In Play Console App access, provide honest disclosure that browsing is public while interaction requires login.
- Before submission, product owner should choose one of:
  - provide a dedicated reviewer Google account, or
  - implement a reviewer/demo access flow in a follow-up compliance mini-phase if review access would otherwise be blocked.

Do not invent credentials and do not claim reviewer access is solved until the chosen path is actually prepared.
