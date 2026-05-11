# BETA OPERATING MODEL — Phase 19

## A) Beta Size Stages
1. **Stage 1:** Internal testing (2–3 accounts)
2. **Stage 2:** 10 trusted users
3. **Stage 3:** 25 users
4. **Stage 4:** 50–100 users
5. **Stage 5:** public waitlist/open beta later

## B) What to Track Manually
- Number of published items
- Number of offers
- Number of accepted offers
- Number of completed deals
- Number of reviews
- Number of reports
- Message-related problems
- Image upload issues
- Most confusing screens

## C) Daily Admin Routine
- Check `/admin/reports`
- If issues reported, check Vercel runtime logs
- Check Supabase usage dashboards
- Execute one critical flow manually (publish → offer → deal step)
- Collect user feedback manually and log it by severity

## D) Beta User Script (Egyptian Arabic)
"جرب بدّلها كنسخة تجريبية. اعرض حاجة مركونة عندك، شوف السوق، وابعت عرض لو لقيت حاجة مناسبة. لو حاجة مش واضحة ابعتلي سكرين."

## E) Rules Before Public Launch
- No unresolved P0 bugs
- Image upload stability verified
- Offer/deal flow tested end-to-end
- Reports/admin flow tested
- Mobile navigation and action accessibility tested
- Privacy and data exposure reviewed
