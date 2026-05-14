# TESWA Google Play Release Prep (GP-01)

## 1) Current goal
Prepare Teswa for Google Play distribution through Trusted Web Activity (TWA) using Bubblewrap, by completing release-readiness web app alignment before local Android packaging.

## 2) What GP-01 audited
- Root metadata in `app/layout.tsx`
- Web App Manifest in `public/manifest.webmanifest`
- Service worker in `public/sw.js`
- Icon references across metadata and manifest
- Offline route availability (`/offline`)
- Production origin note (`metadataBase`)

## 3) What was fixed in GP-01
- Updated root metadata title/description to Season 5 doctrine.
- Updated Open Graph title/description to match the new release narrative.
- Updated manifest description to Season 5-aligned, concise Play/PWA phrasing.
- Added low-risk manifest stability fields: `id: "/"` and `prefer_related_applications: false`.
- Renamed service-worker internal cache namespace from `baddelha` to `teswa` for release consistency.

## 4) Current PWA/TWA readiness snapshot
### Ready
- Manifest is present and linked from root metadata.
- Service worker registration exists and points to `/sw.js`.
- Manifest icon set includes 192, 512, and a maskable icon declaration.
- `/offline` route exists and matches service worker navigation fallback behavior.
- `/install` route exists for install guidance.

### Needs later local confirmation
- Real-device install/add-to-home-screen behavior across Android variants.
- Service worker update lifecycle behavior after repeated production deploys.
- Final icon rendering quality on Play surfaces and Android launcher masks.

### Blocked until Bubblewrap generation
- Android package scaffolding and TWA project files.
- Keystore-based signing and certificate fingerprint outputs.
- Digital Asset Links (`assetlinks.json`) completion using real SHA-256 fingerprints.
- AAB generation and Play Console upload validation.

## 5) Critical deferred items for GP-02+
- Final Play Store listing assets and listing copy.
- Privacy policy final URL and Data safety declarations.
- Bubblewrap project generation on local developer machine.
- Android package ID finalization.
- Signing keystore generation and secure key management.
- `assetlinks.json` creation only after final signing fingerprint exists.
- Android App Bundle (AAB) build and smoke validation.
- Google Play Console submission flow.

## 6) Domain/origin note
- Current canonical origin in repository metadata appears to be `https://baddelha.app`.
- This origin must be explicitly confirmed before Bubblewrap initialization.
- Do not silently change production origin during release packaging prep.

## 7) Recommended next phase
**GP-02 — Store Listing, Policy & Android Release Pack**

## 8) GP-02 completion summary (Store Listing, Policy & Android Release Pack)
### Delivered in GP-02
- Added a public privacy policy route: `/privacy`.
- Created `docs/TESWA_PLAY_STORE_LISTING_PACK.md` for Play listing copy.
- Created `docs/TESWA_DATA_SAFETY_WORKSHEET.md` for Play Data Safety mapping support.
- Created `docs/TESWA_ANDROID_RELEASE_DECISIONS.md` for app/package/screenshots/graphic decisions.
- Created `docs/TESWA_RELEASE_COMPLIANCE_GAPS.md` for unresolved release risks and ownership decisions.

### Pending decisions before Bubblewrap (GP-03)
- Final production origin confirmation.
- Final package ID confirmation.
- Final support/privacy email confirmation.
- Explicit account deletion/deletion-request compliance resolution.

### Branch condition for next phase
- Proceed to **GP-03 — Bubblewrap Local Generation** only if the pending decisions above are finalized.
- If account deletion/compliance scope remains unresolved, execute **GP-02B — Account Deletion / Legal Compliance Completion** first.
