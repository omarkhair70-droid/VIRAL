import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type MaybeArray<T> = T | T[] | null | undefined;
function firstOrNull<T>(value: MaybeArray<T>): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

type ItemJoin = {
  id: string;
  title: string;
  item_images: Array<{ image_url: string | null; is_primary: boolean | null }> | null;
};

type DealRow = {
  id: string;
  created_at: string;
  offer_id: string;
  requester_id: string;
  offerer_id: string;
  requester: MaybeArray<{ display_name: string | null }>;
  offerer: MaybeArray<{ display_name: string | null }>;
  offered_item: MaybeArray<ItemJoin>;
  requested_item: MaybeArray<ItemJoin>;
};

export default async function DealDetailPage({ params }: { params: Promise<{ dealId: string }> }) {
  const { dealId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/deals/${dealId}`);

  const { data } = await supabase
    .from("swap_deals")
    .select("id,created_at,offer_id,requester_id,offerer_id,requester:profiles!swap_deals_requester_id_fkey(display_name),offerer:profiles!swap_deals_offerer_id_fkey(display_name),offered_item:items!swap_deals_offered_item_id_fkey(id,title,item_images(image_url,is_primary)),requested_item:items!swap_deals_requested_item_id_fkey(id,title,item_images(image_url,is_primary))")
    .eq("id", dealId)
    .maybeSingle();

  if (!data) notFound();
  const deal = data as unknown as DealRow;
  if (user.id !== deal.requester_id && user.id !== deal.offerer_id) notFound();

  const offered = firstOrNull(deal.offered_item);
  const requested = firstOrNull(deal.requested_item);
  if (!offered || !requested) notFound();

  const offererName = firstOrNull(deal.offerer)?.display_name ?? "مستخدم";
  const requesterName = firstOrNull(deal.requester)?.display_name ?? "صاحب الإعلان";

  return (
    <section className="mx-auto max-w-5xl space-y-6 px-4 py-10">
      <h1 className="text-3xl font-bold">تنسيق المقايضة</h1>
      <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900">جاري التنسيق</span>
      <p className="text-stone-700">العرض اتقبل. دلوقتي اتفقوا بهدوء على التفاصيل خارج الموقع لحد ما نفتح الشات والتسليم.</p>

      <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr]">
        <article className="rounded-2xl border bg-white p-4"><p className="mb-2 text-sm text-stone-500">الحاجة المعروضة</p><h2 className="font-semibold">{offered.title}</h2></article>
        <div className="self-center text-center text-3xl">↔</div>
        <article className="rounded-2xl border bg-white p-4"><p className="mb-2 text-sm text-stone-500">الحاجة المطلوبة</p><h2 className="font-semibold">{requested.title}</h2></article>
      </div>

      <div className="rounded-2xl border bg-stone-50 p-4 text-sm text-stone-700">
        <p>المشاركين: {offererName} و {requesterName}</p>
        <p>تاريخ القبول: {new Date(deal.created_at).toLocaleDateString("ar-EG")}</p>
      </div>

      <section className="rounded-2xl border p-4"><h2 className="mb-2 text-xl font-semibold">ملخص الصفقة</h2><p>{offererName} هيبدّل {offered.title} مقابل {requested.title} مع {requesterName}.</p></section>
      <section className="rounded-2xl border p-4"><h2 className="mb-2 text-xl font-semibold">الخطوة الجاية</h2><ul className="list-disc space-y-1 pr-5 text-stone-700"><li>اتأكدوا إن وصف الحاجتين واضح.</li><li>اتفقوا على مكان عام وآمن.</li><li>ما تبعتش فلوس مقدماً.</li><li>لو حاجة مش مريحة، وقف الصفقة.</li></ul></section>
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><h2 className="mb-2 text-xl font-semibold">حدود المرحلة الحالية</h2><p>لسه مفيش شات أو دفع أو توصيل داخل الموقع. التنسيق الكامل جاي في مرحلة لاحقة.</p></section>

      <div className="flex flex-wrap gap-3"><Link href={`/offers/${deal.offer_id}`} className="rounded-xl border px-4 py-2">افتح العرض الأصلي</Link><Link href={`/items/${offered.id}`} className="rounded-xl border px-4 py-2">افتح الحاجة المعروضة</Link><Link href={`/items/${requested.id}`} className="rounded-xl border px-4 py-2">افتح الحاجة المطلوبة</Link><Link href="/offers/new" className="rounded-xl bg-clay px-4 py-2 text-white">ارجع للعروض</Link></div>
    </section>
  );
}
