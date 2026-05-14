# TESWA Android Release Decisions (GP-02C)

## 1) Current live origin for GP-03
- Current live origin for GP-03: `https://viral-one-delta.vercel.app`
- Status: Confirmed for local Bubblewrap generation and Android testing.
- Note: A branded custom domain may still replace this before final Play submission.

## 2) App name
- App name: **تِسوى**
- Launcher label recommendation: **تِسوى**

## 3) Final GP-03 package ID
- `app.teswa.android`

Notes:
- This is the selected application ID for the Android project generated in GP-03.
- It should be treated as the intended release package ID unless a deliberate change is made before any Play Console publication.
- Do not change it casually after Play release.

## 4) TWA/Bubblewrap inputs for GP-03
- Manifest URL: `https://viral-one-delta.vercel.app/manifest.webmanifest`
- App name: `تِسوى`
- Launcher label: `تِسوى`
- Package ID: `app.teswa.android`
- Start URL: `/`
- Theme/background color: use current manifest/app values (no new values introduced here)
- Final support/privacy email: deferred until Play submission prep

## 5) Digital Asset Links status (GP-04)
- Signing certificate fingerprint now exists.
- `assetlinks.json` has been prepared for the current Vercel origin: `https://viral-one-delta.vercel.app`.
- Final live verification is still required after deployment.

Recorded values:
- Package ID: `app.teswa.android`
- SHA-256 fingerprint: `F3:03:09:68:B0:54:A3:DC:CE:84:9B:3E:56:05:7D:A4:8C:45:62:BD:BA:1F:2F:D9:45:52:67:B2:61:37:4A:2F`

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
