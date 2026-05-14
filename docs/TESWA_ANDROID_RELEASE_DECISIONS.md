# TESWA Android Release Decisions (GP-02)

## 1) Confirmed current origin
- Current canonical origin in repo/docs: `https://baddelha.app`
- Status: **Needs final human confirmation before GP-03**

## 2) App name
- App name: **تِسوى**
- Launcher label recommendation: **تِسوى**

## 3) Package ID decision support
Recommended shortlist:
1. `app.baddelha.teswa`
2. `app.teswa.mobile`
3. `com.teswa.app`

Pros/cons summary:
- `app.baddelha.teswa`: strongest continuity with current domain identity; slightly longer.
- `app.teswa.mobile`: clean and brand-forward; depends less on domain permanence.
- `com.teswa.app`: classic Android style and readable; may need uniqueness checks.

**Final package ID must be chosen before GP-03 and should not be changed after Play release.**

## 4) TWA/Bubblewrap inputs needed in GP-03
- Manifest URL
- App name
- Package ID
- Launcher name
- Theme/background color
- Start URL
- Signing keystore + password decisions
- Version name/code decisions
- Final production origin confirmation

## 5) Digital Asset Links dependency
`assetlinks.json` cannot be finalized until the real signing certificate fingerprint exists.
This step belongs to **GP-04 / post-signing** execution.

## 6) Screenshot plan (Play listing storyboard)

1. **Home possibility feed**
   - Headline: "كل حاجة ممكن تبدأ من هنا"
   - Promise: discovery of ongoing value opportunities.

2. **Explore / discovery worlds**
   - Headline: "استكشف بحسب اهتمامك"
   - Promise: structured discovery beyond random classifieds.

3. **Publish flow (value framing)**
   - Headline: "اعرض حاجتك بصياغة واضحة"
   - Promise: easy publishing with meaningful context.

4. **Thing detail / value question page**
   - Headline: "القيمة في التفاصيل"
   - Promise: informed decisions via transparent descriptions.

5. **Offer/proposal composer**
   - Headline: "قدّم اقتراح يناسب الطرفين"
   - Promise: negotiation and exchange coordination.

6. **Public Motion / activity page**
   - Headline: "تابع حركة القيمة"
   - Promise: visible ecosystem momentum and trust.

7. **People / personality page**
   - Headline: "تعرف على أسلوب كل شخص"
   - Promise: human-centered profiles and preferences.

8. **Optional: dashboard/trust coordination**
   - Headline: "نسّق صفقاتك بخطوات واضحة"
   - Promise: organized tracking of active exchanges.

## 7) Feature graphic direction
- Premium editorial style with warm, clean background.
- Primary wordmark: **تِسوى**.
- One-line promise focused on value/possibility (not bargain-bin classifieds tone).
- Minimal composition; avoid noisy collage.
- Visual mood: curiosity, trust, and intelligent exchange.
