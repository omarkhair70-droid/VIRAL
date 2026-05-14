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
- Signing keystore generation and secure key management.
- `assetlinks.json` creation only after final signing fingerprint exists.
- Android App Bundle (AAB) build and smoke validation.
- Google Play Console submission flow.

## 6) Current live origin for GP-03
- Current working production deployment: `https://viral-one-delta.vercel.app`
- GP-03 Bubblewrap init should use: `https://viral-one-delta.vercel.app/manifest.webmanifest`
- A future branded custom domain may still be adopted before final Play Store submission.
- If the production origin changes later, Bubblewrap/TWA configuration and Asset Links must be updated accordingly before final release.

## 7) Recommended next phase
**GP-02 — Store Listing, Policy & Android Release Pack**

## 8) GP-02 completion summary (Store Listing, Policy & Android Release Pack)
### Delivered in GP-02
- Added a public privacy policy route: `/privacy`.
- Created `docs/TESWA_PLAY_STORE_LISTING_PACK.md` for Play listing copy.
- Created `docs/TESWA_DATA_SAFETY_WORKSHEET.md` for Play Data Safety mapping support.
- Created `docs/TESWA_ANDROID_RELEASE_DECISIONS.md` for app/package/screenshots/graphic decisions.
- Created `docs/TESWA_RELEASE_COMPLIANCE_GAPS.md` for unresolved release risks and ownership decisions.

## 9) GP-02B completion summary (Account Deletion & Compliance Completion)
### Delivered in GP-02B
- Added public account deletion request flow at `/account-deletion`.
- Added authenticated in-app account deletion request flow at `/profile/delete-account`.
- Added database intake table and status lifecycle for deletion requests.
- Updated privacy, data safety worksheet, and release compliance documentation to match implemented behavior.

### Remaining blockers moved to final submission prep (not GP-03 blockers)
- Production origin is now confirmed and no longer blocks GP-03.
- Package ID is now selected for GP-03.
- Support/privacy contact emails remain deferred until store submission prep.
- Final custom-domain decision remains a pre-submission release polish decision, not a GP-03 blocker.

## 10) Recommended next phase
Proceed to **GP-03 — Bubblewrap Local Generation**.

## 11) GP-04 progress summary (Digital Asset Links & TWA verification prep)
### Delivered in GP-04
- GP-03 successfully generated signed Android artifacts locally: `app-release-signed.apk` and `app-release-bundle.aab`.
- Real signing certificate SHA-256 fingerprint was extracted from the generated signing keystore.
- Added Digital Asset Links file at `public/.well-known/assetlinks.json` for:
  - origin: `https://viral-one-delta.vercel.app`
  - package: `app.teswa.android`

### Required post-deployment verification
- Confirm the live endpoint resolves:
  - `https://viral-one-delta.vercel.app/.well-known/assetlinks.json`
- Install `app-release-signed.apk` on an Android device.
- Verify launch behavior opens as a Trusted Web Activity (no browser chrome/address bar visible).

