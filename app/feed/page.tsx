import Link from "next/link";
import { OfferCard, type RealOfferCardData } from "@/components/offers/offer-card";
import { FeedCard } from "@/components/feed-card";
import { SectionHeading } from "@/components/section-heading";
import { EmptyStatePanel } from "@/components/ui/empty-state-panel";
import { createClient } from "@/lib/supabase/server";
import { demoFeedItems } from "@/lib/demo-feed";

type MaybeArray<T> = T | T[] | null | undefined;
function firstOrNull<T>(value: MaybeArray<T>): T | null { if (!value) return null; return Array.isArray(value) ? value[0] ?? null : value; }

type OfferRow = { id: string; status: string; created_at: string; sender_profile: MaybeArray<{ display_name: string | null; username: string | null }>; receiver_profile: MaybeArray<{ display_name: string | null; username: string | null }>; requested_item: MaybeArray<{ title: string; item_images: Array<{ image_url: string | null; is_primary: boolean | null }> | null }>; offered_item: MaybeArray<{ title: string; item_images: Array<{ image_url: string | null; is_primary: boolean | null }> | null }>; };

export default async function FeedPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("offers").select("id,status,created_at,sender_profile:profiles!offers_sender_id_fkey(display_name,username),receiver_profile:profiles!offers_receiver_id_fkey(display_name,username),requested_item:items!offers_requested_item_id_fkey(title,item_images(image_url,is_primary)),offered_item:items!offers_offered_item_id_fkey(title,item_images(image_url,is_primary))").order("created_at", { ascending: false }).limit(24);
  const realOffers: RealOfferCardData[] = ((data ?? []) as unknown as OfferRow[]).map((row) => {
    const sender = firstOrNull(row.sender_profile); const receiver = firstOrNull(row.receiver_profile); const requested = firstOrNull(row.requested_item); const offered = firstOrNull(row.offered_item);
    return { id: row.id, status: row.status, createdAt: row.created_at, senderName: sender?.display_name ?? sender?.username ?? "مستخدم", receiverName: receiver?.display_name ?? receiver?.username ?? "مستخدم", offeredTitle: offered?.title ?? "حاجة معروضة", requestedTitle: requested?.title ?? "حاجة مطلوبة", offeredImage: offered?.item_images?.find((x) => x.is_primary)?.image_url ?? offered?.item_images?.[0]?.image_url ?? null, requestedImage: requested?.item_images?.find((x) => x.is_primary)?.image_url ?? requested?.item_images?.[0]?.image_url ?? null };
  });

  return <section className="mx-auto max-w-6xl px-4 py-10"><SectionHeading title="العروض اللي بتحصل" subtitle="شوف الناس بتعرض إيه على إيه. مش كل عرض لازم يبقى منطقي للناس… المهم ينفع أصحابه." />{realOffers.length > 0 ? <div className="space-y-6"><div className="grid gap-4 md:grid-cols-2">{realOffers.map((offer) => <OfferCard key={offer.id} offer={offer} />)}</div></div> : <div className="space-y-6"><EmptyStatePanel title="لسه مفيش عروض حقيقية كتير." subtitle="ابدأ بأول عرض، أو اتفرّج على أمثلة توضيحية." actions={<><Link href="/items" className="rounded-xl border border-stone-300 px-5 py-3">شوف السوق</Link><Link href="/items/new" className="rounded-xl bg-clay px-5 py-3 text-white">اعرض حاجة</Link></>} /><div><h2 className="mb-3 font-semibold">أمثلة توضيحية — مش عروض حقيقية</h2><div className="grid gap-4 md:grid-cols-2">{demoFeedItems.slice(0, 4).map((item) => <FeedCard key={item.id} item={item} />)}</div></div></div>}<div className="mt-8 flex flex-wrap gap-3"><Link href="/items" className="rounded-xl border border-stone-300 px-5 py-3">السوق</Link><Link href="/items/new" className="rounded-xl bg-clay px-5 py-3 text-white">اعرض حاجة</Link></div></section>;
}
