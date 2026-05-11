# Swap Marketplace (Phase 0 Foundation)

منصة تبادل اجتماعي عربية أولاً.

> يمكن الحاجة اللي مركونة عندك هي بالظبط اللي حد تاني بيدور عليها.

## Phase 0 Scope
- تأسيس Next.js App Router + Tailwind + TypeScript.
- إعداد Supabase SSR auth بالكوكيز.
- إنشاء schema + RLS + seed data.
- صفحات placeholder فقط.

## Intentionally NOT Included
لا يوجد نشر منتجات فعلي، إرسال عروض، تنسيق صفقات، دفع، شحن، دردشة، AI matching، أو multi-way swap في المرحلة دي.

## Setup
1. `npm install`
2. انسخ `.env.example` إلى `.env.local` واضبط القيم.
3. أنشئ مشروع Supabase.
4. نفذ migration:
   - `supabase db push` (أو شغّل SQL من `supabase/migrations/...`)
5. شغّل المشروع:
   - `npm run dev`

## Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

## Supabase Notes
- استخدم `@supabase/ssr` فقط.
- لا تستخدم service role key في المتصفح.
- trigger ينشئ profile تلقائيًا بعد إنشاء user.

## Storage (Manual Dashboard Step)
أنشئ bucket باسم `item-images`:
- Public read: enabled
- Upload: authenticated users
- المسار المقترح: `items/{userId}/{itemId}/{filename}`

## Commands
- Dev: `npm run dev`
- Lint: `npm run lint`
- Build: `npm run build`

## Vercel Deploy Notes
- أضف env vars في Vercel Project Settings.
- تأكد إن Supabase URL + publishable key متاحين لكل البيئات.

## Next Phases (High-level)
- Phase 1: item listing flow + lightweight discover UX.
- Phase 2: offers lifecycle + events.
- Phase 3: deal coordination + confirmations + reviews.
