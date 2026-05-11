import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type DealRow = { id: string; status: string; created_at: string; offered_item: { title: string }[] | null; requested_item: { title: string }[] | null };

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

  return (
    <section className="mx-auto max-w-4xl space-y-4 px-4 py-10">
      <h1 className="text-3xl font-bold">صفقات مقبولة</h1>
      {deals.length === 0 ? <p className="rounded-xl border bg-white p-4 text-stone-700">لسه مفيش صفقات مقبولة عندك.</p> : null}
      {deals.map((deal) => (
        <article key={deal.id} className="rounded-xl border bg-white p-4">
          <p className="text-sm text-stone-500">{new Date(deal.created_at).toLocaleDateString("ar-EG")}</p>
          <p className="mt-1 font-semibold">{deal.offered_item?.[0]?.title ?? "حاجة"} ↔ {deal.requested_item?.[0]?.title ?? "حاجة"}</p>
          <p className="text-sm text-amber-800">الحالة: جاري التنسيق</p>
          <Link href={`/deals/${deal.id}`} className="mt-2 inline-flex rounded-lg border px-3 py-2 text-sm">افتح صفحة التنسيق</Link>
        </article>
      ))}
    </section>
  );
}
