# STORAGE & IMAGES OPERATIONS (Phase 23)

## Current storage posture
- Bucket: `item-images`.
- Public-read by design for marketplace listing visibility.
- Listing images are public URLs.

## User safety rule (must remain visible)
Users must **not** upload:
- IDs/passports/licenses.
- Phone numbers.
- Home/work addresses.
- Private documents.

## Current constraints
- Max images per item: 4.
- Max size per image: 5MB.
- Allowed types: JPG/PNG/WEBP.

## Known risk
- Upload/publish split can leave orphan storage objects if publish fails after upload.

## Manual cleanup strategy (beta)
- Periodically review old objects not linked to `item_images` (when tooling is available).
- Do not delete blindly; always verify DB linkage first.

## Future hardening
- Automated orphan cleanup job.
- HEIC conversion guidance/path.
- Stricter file validation.
- Image compression workflow.
- Separate private evidence bucket if report attachments are introduced.
