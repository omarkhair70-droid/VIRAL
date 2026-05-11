import Link from "next/link";
import { notFound } from "next/navigation";
import { OfferItemCard } from "@/components/offers/offer-item-card";
import { OfferStatusBadge } from "@/components/offers/offer-status-badge";
import { createClient } from "@/lib/supabase/server";

type MaybeArray<T> = T | T[] | null | undefined;
function firstOrNull<T>(value: MaybeArray<T>): T | null { if (!value) return null; return Array.isArray(value) ? value[0] ?? null : value; }

type ItemJoin = { id: string; title: string; condition: "almost_new"|"good_used"|"minor_issues"|"needs_repair"; item_images: Array<{image_url:string|null;is_primary:boolean|null}>|null; profiles: MaybeArray<{display_name:string|null}>; categories: MaybeArray<{name_ar:string|null}> };
type OfferRow = { id: string; status: string; message: string | null; created_at: string; sender_id: string; receiver_id: string; requested_item_id: string; offered_item_id: string; requested_item: MaybeArray<ItemJoin>; offered_item: MaybeArray<ItemJoin>; offer_events: Array<{id:string;event_type:string;created_at:string}>|null; };
const conditionLabels = { almost_new: "جديد تقريبًا", good_used: "مستخدم بحالة كويسة", minor_issues: "فيه عيوب بسيطة", needs_repair: "محتاج تصليح / عارف حالته" };

export default async function OfferDetail({ params }: { params: Promise<{ offerId: string }> }) {
  const { offerId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("offers")
    .select("id,status,message,created_at,sender_id,receiver_id,requested_item_id,offered_item_id,requested_item:items!offers_requested_item_id_fkey(id,title,condition,item_images(image_url,is_primary),categories(name_ar),profiles!items_owner_id_fkey(display_name)),offered_item:items!offers_offered_item_id_fkey(id,title,condition,item_images(image_url,is_primary),categories(name_ar),profiles!items_owner_id_fkey(display_name)),offer_events(id,event_type,created_at)")
    .eq("id", offerId)
    .maybeSingle();

  if (!data) notFound();
  const offer = data as unknown as OfferRow;
  const requested = firstOrNull(offer.requested_item);
  const offered = firstOrNull(offer.offered_item);
  if (!requested || !offered) notFound();

  const reqOwner = firstOrNull(requested.profiles)?.display_name ?? "صاحب الإعلان";
  const offOwner = firstOrNull(offered.profiles)?.display_name ?? "مستخدم";
  const reqImg = requested.item_images?.find((x) => x.is_primary)?.image_url ?? requested.item_images?.[0]?.image_url ?? null;
  const offImg = offered.item_images?.find((x) => x.is_primary)?.image_url ?? offered.item_images?.[0]?.image_url ?? null;

  return <section className="mx-auto max-w-5xl space-y-5 px-4 py-10">
    <h1 className="text-3xl font-bold">عرض مقايضة</h1>
    <OfferStatusBadge status={offer.status} />
    <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr]"><OfferItemCard itemId={offered.id} title={offered.title} imageUrl={offImg} category={firstOrNull(offered.categories)?.name_ar ?? null} conditionLabel={conditionLabels[offered.condition]} ownerName={offOwner} /><div className="self-center text-center text-3xl">↔</div><OfferItemCard itemId={requested.id} title={requested.title} imageUrl={reqImg} category={firstOrNull(requested.categories)?.name_ar ?? null} conditionLabel={conditionLabels[requested.condition]} ownerName={reqOwner} /></div>
    <p>{offOwner} شايف إن {offered.title} تستاهل {requested.title} عند {reqOwner}.</p>
    {offer.message ? <div className="rounded-xl border p-3"><p className="font-semibold">رسالة العرض:</p><p>«{offer.message}»</p></div> : null}
    <div className="rounded-xl bg-stone-50 p-3"><p className="font-semibold">الخط الزمني</p><ul className="list-disc pr-4"><li>العرض اتبعت - {new Date(offer.created_at).toLocaleDateString("ar-EG")}</li></ul></div>
    {user?.id === offer.receiver_id ? <div className="rounded-xl border border-amber-200 bg-amber-50 p-3"><p className="mb-2">الرد على العرض جاي في المرحلة الجاية:</p><div className="flex flex-wrap gap-2">{["اقبل", "ممكن أفكر", "العرض ما ظبطش", "افتح باب تاني"].map((label) => <button disabled key={label} className="rounded-lg border px-3 py-2 text-sm opacity-70">{label} - قريبًا</button>)}</div></div> : null}
    {user?.id === offer.sender_id ? <p className="rounded-xl bg-blue-50 p-3 text-blue-900">ده عرضك. مستني رد صاحب الحاجة.</p> : null}
    <div className="flex flex-wrap gap-3"><Link href={`/items/${requested.id}`} className="rounded-xl border px-4 py-2">افتح الحاجة المطلوبة</Link><Link href={`/items/${offered.id}`} className="rounded-xl border px-4 py-2">افتح الحاجة المعروضة</Link><Link href="/items" className="rounded-xl bg-clay px-4 py-2 text-white">اعرض حاجة عندك على حاجة شبهها</Link></div>
  </section>;
}
