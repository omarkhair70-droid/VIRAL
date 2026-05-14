import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { HeroPanel, InlineNotice, PageSection, PageShell, SoftPanel, SurfaceCard } from "@/components/ui/surfaces";
import { notFound } from "next/navigation";
import { OfferItemCard } from "@/components/offers/offer-item-card";
import { OfferStatusBadge } from "@/components/offers/offer-status-badge";
import { OfferResponsePanel } from "./offer-response-panel";
import { OfferTimeline } from "./offer-timeline";
import { createClient } from "@/lib/supabase/server";

type MaybeArray<T> = T | T[] | null | undefined;
function firstOrNull<T>(value: MaybeArray<T>): T | null { if (!value) return null; return Array.isArray(value) ? value[0] ?? null : value; }

type ItemJoin = { id: string; title: string; condition: "almost_new"|"good_used"|"minor_issues"|"needs_repair"; item_images: Array<{image_url:string|null;is_primary:boolean|null}>|null; profiles: MaybeArray<{display_name:string|null;username:string|null}>; categories: MaybeArray<{name_ar:string|null}> };
type OfferRow = { id: string; status: string; message: string | null; public_note: string | null; redirect_type: string | null; created_at: string; sender_id: string; receiver_id: string; requested_item_id: string; offered_item_id: string; parent_offer_id: string | null; requested_item: MaybeArray<ItemJoin>; offered_item: MaybeArray<ItemJoin>; offer_events: Array<{id:string;event_type:string;created_at:string;note:string|null}>|null; };
type DealRow = { id: string; requester_id: string; offerer_id: string };
const conditionLabels = { almost_new: "جديد تقريبًا", good_used: "مستخدم بحالة كويسة", minor_issues: "فيه عيوب بسيطة", needs_repair: "محتاج تصليح / عارف حالته" };

const redirectMap: Record<string, string> = { offer_another_item: "اعرض حاجة تانية", ask_for_different_item: "بدور على نوع مختلف", update_preferences: "وضّح اختياراتك أكتر" };
const errorMap: Record<string, string> = { not_allowed: "مش مسموح ترد على العرض ده.", invalid_status: "العرض ده اترد عليه بالفعل.", response_failed: "مش قادرين نحدّث العرض دلوقتي. جرّب تاني.", invalid_redirect_type: "لازم تختار نوع الباب التاني." };
const responseMap: Record<string, string> = { accepted: "تم قبول العرض وفتح مسار التنسيق.", thinking: "تم تحديث العرض إلى محتاج تفكير.", soft_rejected: "تم تسجيل الرد: العرض ما ظبطش.", redirected: "تم فتح باب تاني للعرض." };

export default async function OfferDetail({ params, searchParams }: { params: Promise<{ offerId: string }>; searchParams?: Promise<{ error?: string; response?: string; reported?: string }> }) {
  const { offerId } = await params;
  const query = (await searchParams) ?? {};
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("offers")
    .select("id,status,message,public_note,redirect_type,created_at,sender_id,receiver_id,requested_item_id,offered_item_id,parent_offer_id,requested_item:items!offers_requested_item_id_fkey(id,title,condition,item_images(image_url,is_primary),categories(name_ar),profiles!items_owner_id_fkey(display_name,username)),offered_item:items!offers_offered_item_id_fkey(id,title,condition,item_images(image_url,is_primary),categories(name_ar),profiles!items_owner_id_fkey(display_name,username)),offer_events(id,event_type,created_at,note)")
    .eq("id", offerId)
    .maybeSingle();

  if (!data) notFound();
  const offer = data as unknown as OfferRow;
  const requested = firstOrNull(offer.requested_item);
  const offered = firstOrNull(offer.offered_item);
  if (!requested || !offered) notFound();

  const reqOwner = firstOrNull(requested.profiles)?.display_name ?? "صاحب الإعلان";
  const offOwner = firstOrNull(offered.profiles)?.display_name ?? "مستخدم";
  const reqProfile = firstOrNull(requested.profiles);
  const offProfile = firstOrNull(offered.profiles);

  const reqImg = requested.item_images?.find((x) => x.is_primary)?.image_url ?? requested.item_images?.[0]?.image_url ?? null;
  const offImg = offered.item_images?.find((x) => x.is_primary)?.image_url ?? offered.item_images?.[0]?.image_url ?? null;
  const isReceiver = user?.id === offer.receiver_id;
  const isSender = user?.id === offer.sender_id;
  const isParticipant = isReceiver || isSender;
  const canRespond = isReceiver && (offer.status === "pending" || offer.status === "thinking");


  let deal: DealRow | null = null;
  if (offer.status === "accepted") {
    const { data: dealData } = await supabase
      .from("swap_deals")
      .select("id,requester_id,offerer_id")
      .eq("offer_id", offer.id)
      .maybeSingle();
    deal = (dealData as DealRow | null) ?? null;
  }

  return <PageShell className="mx-auto max-w-5xl px-4 py-10"><PageSection className="space-y-6">
    <HeroPanel className="space-y-3"><h1 className="text-3xl font-bold">عرض مقايضة</h1><OfferStatusBadge status={offer.status} /><p className="text-sm text-app-text-muted">{isReceiver ? "راجع العرض واختار الرد المناسب." : "تابع حالة عرضك واعرف الخطوة الجاية."}</p></HeroPanel>
    {query.error && errorMap[query.error] ? <InlineNotice tone="danger">{errorMap[query.error]}</InlineNotice> : null}
    {query.response ? <InlineNotice tone="accent">{responseMap[query.response] ?? "تم تحديث حالة العرض."}</InlineNotice> : null}
    {query.reported === "1" ? <InlineNotice tone="accent">تم إرسال البلاغ. شكرًا إنك ساعدتنا نحافظ على التجربة.</InlineNotice> : null}
    <SurfaceCard className="grid gap-4 p-4 md:grid-cols-[1fr_auto_1fr]"><OfferItemCard itemId={offered.id} title={offered.title} imageUrl={offImg} category={firstOrNull(offered.categories)?.name_ar ?? null} conditionLabel={conditionLabels[offered.condition]} ownerName={offOwner} /><div className="self-center text-center text-3xl">↔</div><OfferItemCard itemId={requested.id} title={requested.title} imageUrl={reqImg} category={firstOrNull(requested.categories)?.name_ar ?? null} conditionLabel={conditionLabels[requested.condition]} ownerName={reqOwner} /></SurfaceCard>
    <SoftPanel><p className="text-stone-700">{offProfile?.username ? <Link href={`/users/${offProfile.username}`} className="hover:underline">{offOwner}</Link> : offOwner} عرض {offered.title} مقابل {requested.title} لصاحب الإعلان {reqProfile?.username ? <Link href={`/users/${reqProfile.username}`} className="hover:underline">{reqOwner}</Link> : reqOwner}.</p></SoftPanel>
    {offer.message ? <div className="rounded-xl border p-3"><p className="font-semibold">رسالة العرض:</p><p>«{offer.message}»</p></div> : null}
    {offer.public_note ? <div className="rounded-xl border border-sky-200 bg-sky-50 p-3"><p className="font-semibold">ملاحظة صاحب الحاجة:</p><p>«{offer.public_note}»</p></div> : null}
    {offer.redirect_type ? <p className="text-sm text-stone-600">نوع الباب التاني: {redirectMap[offer.redirect_type] ?? offer.redirect_type}</p> : null}
    {offer.parent_offer_id ? <div className="rounded-xl border border-sky-200 bg-sky-50 p-3"><p className="font-semibold">العرض ده جاي بعد فتح باب تاني</p><Link className="text-sm underline" href={`/offers/${offer.parent_offer_id}`}>افتح العرض الأصلي</Link></div> : null}

    <OfferTimeline events={offer.offer_events} hasParentOffer={Boolean(offer.parent_offer_id)} />

    {canRespond ? <OfferResponsePanel offerId={offer.id} /> : null}
    {isSender && offer.status === "pending" ? <p className="rounded-xl bg-blue-50 p-3 text-blue-900">عرضك اتبعت. مستني رد صاحب الحاجة.</p> : null}
    {isSender && offer.status === "thinking" ? <p className="rounded-xl bg-yellow-50 p-3 text-yellow-900">صاحب الحاجة شاف العرض ومحتاج يفكر.</p> : null}
    {isSender && offer.status === "accepted" ? <p className="rounded-xl bg-emerald-50 p-3 text-emerald-900">عرضك اتقبل. افتح صفحة التنسيق واتفقوا بهدوء.</p> : null}
    {isSender && offer.status === "soft_rejected" ? <p className="rounded-xl bg-stone-100 p-3 text-stone-700">العرض ما ظبطش المرة دي. ممكن تجرّب إعلان تاني مناسب.</p> : null}
    {isSender && offer.status === "redirected" ? <div className="space-y-2 rounded-xl bg-sky-50 p-3 text-sky-900"><p className="font-semibold">صاحب الحاجة فتح باب تاني. اختار حاجة مختلفة وابعت عرض تاني.</p><p>العرض الجديد لازم يكون بحاجة مختلفة عن العرض الأول.</p><Link href={`/offers/new?fromOffer=${offer.id}`} className="inline-flex rounded-lg bg-sky-700 px-3 py-2 text-sm text-white">ابعت عرض تاني</Link></div> : null}

    {isReceiver && offer.status === "accepted" ? <p className="rounded-xl bg-emerald-50 p-3 text-emerald-900">أنت قبلت العرض. تقدروا تبدأوا التنسيق من الصفحة الخاصة.</p> : null}
    {isReceiver && offer.status === "soft_rejected" ? <p className="rounded-xl bg-stone-100 p-3 text-stone-700">أنت رفضت العرض بلطف.</p> : null}
    {isReceiver && offer.status === "redirected" ? <p className="rounded-xl bg-sky-50 p-3 text-sky-900">أنت فتحت باب تاني لصاحب العرض. لو بعت عرض جديد هيظهرلك هنا كعرض منفصل مرتبط بالعرض ده.</p> : null}

    {offer.status === "accepted" && isParticipant ? (
      deal ? (
        <Link href={`/deals/${deal.id}`} className="inline-flex rounded-xl bg-emerald-700 px-4 py-2 text-white">افتح صفحة التنسيق</Link>
      ) : (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900">العرض اتقبل، وصفحة التنسيق لسه بتتجهز.</p>
      )
    ) : null}

    <div className="flex flex-wrap gap-3"><Link href={`/items/${requested.id}`} className="inline-flex min-h-10 rounded-button bg-transparent px-3 py-2 text-sm text-app-text-muted hover:bg-app-soft">افتح الحاجة المطلوبة</Link><Link href={`/items/${offered.id}`} className="inline-flex min-h-10 rounded-button bg-transparent px-3 py-2 text-sm text-app-text-muted hover:bg-app-soft">افتح الحاجة المعروضة</Link><ButtonLink href="/feed" variant="secondary" size="sm">ارجع للعروض</ButtonLink></div>{isParticipant ? <Link href={`/report?offerId=${offer.id}&returnTo=${encodeURIComponent(`/offers/${offer.id}`)}`} className="inline-block text-sm text-stone-600 hover:underline">بلّغ عن العرض</Link> : null}
  </PageSection></PageShell>;
}
