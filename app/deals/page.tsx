import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type DealRow = { id: string; status: string; created_at: string; offered_item: { title: string }[] | null; requested_item: { title: string }[] | null };

const statusMap: Record<string, string> = {
  coordinating: "جاري التنسيق",
  completed_pending_confirmation: "مستني تأكيد",
  completed: "تمت المقايضة",
  cancelled: "اتلغت",
  disputed: "عليها مشكلة",
};

export default async function DealsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/deals");

  const { data } = await supabase
    .from("swap_deals")
    .select("id,status,created_at,offered_item:items!swap_deals_offered_item_id_fkey(title),requested_item:items!swap_deals_requested_item_id_fkey(title)")
    .or(`requester_id.eq.${user.id},offerer_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  const deals = (data as DealRow[] | null) ?? [];
  const grouped = {
    all: deals,
    coordinating: deals.filter((deal) => deal.status === "coordinating"),
    pendingConfirmation: deals.filter((deal) => deal.status === "completed_pending_confirmation"),
    completed: deals.filter((deal) => deal.status === "completed"),
    cancelledOrDisputed: deals.filter((deal) => deal.status === "cancelled" || deal.status === "disputed"),
  };

  return (
    <section className="mx-auto max-w-4xl space-y-4 px-4 py-10">
      <h1 className="text-3xl font-bold">صفقاتي</h1><p className="text-sm text-stone-600">جاري التنسيق: لسه بتتفقوا. مستني تأكيد: الطرفين محتاجين يأكدوا الإتمام. تمت المقايضة: الصفقة خلصت واتقفلت.</p><p className="text-sm text-stone-600">افتح الصفقة لمتابعة رسائل التنسيق.</p>
      <div className="grid gap-2 rounded-xl border bg-white p-3 text-sm sm:grid-cols-5">
        <p>الكل: <span className="font-semibold">{grouped.all.length}</span></p>
        <p>جاري التنسيق: <span className="font-semibold">{grouped.coordinating.length}</span></p>
        <p>مستني تأكيد: <span className="font-semibold">{grouped.pendingConfirmation.length}</span></p>
        <p>تمت: <span className="font-semibold">{grouped.completed.length}</span></p>
        <p>ملغية/مشكلة: <span className="font-semibold">{grouped.cancelledOrDisputed.length}</span></p>
      </div>
      {deals.length === 0 ? <div className="rounded-xl border bg-white p-5"><p className="font-semibold">لسه مفيش صفقات عندك.</p><p className="mt-1 text-sm text-stone-600">أول ما عرض يتقبل هتلاقيه هنا وتقدر تتابع حالته.</p><Link href="/items" className="mt-3 inline-flex rounded-lg border px-3 py-2 text-sm">شوف السوق</Link></div> : null}
      {deals.map((deal) => (
        <article key={deal.id} className="rounded-xl border bg-white p-4">
          <p className="text-sm text-stone-500">{new Date(deal.created_at).toLocaleDateString("ar-EG")}</p>
          <p className="mt-1 font-semibold">{deal.offered_item?.[0]?.title ?? "حاجة"} ↔ {deal.requested_item?.[0]?.title ?? "حاجة"}</p>
          <p className="text-sm text-amber-800">الحالة: {statusMap[deal.status] ?? deal.status}</p>
          <Link href={`/deals/${deal.id}`} className="mt-2 inline-flex rounded-lg border px-3 py-2 text-sm">افتح صفحة التنسيق</Link>
        </article>
      ))}
    </section>
  );
}
