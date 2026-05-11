import Link from "next/link";
import { ItemCard } from "@/components/item-card";
import { SectionHeading } from "@/components/section-heading";
import { createClient } from "@/lib/supabase/server";

export default async function ItemsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("items")
    .select("id,title,condition,city,area,desire_mode,desire_text,categories(name_ar),item_images(image_url,is_primary)")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const items = (data ?? []).map((item: any) => ({
    id: item.id,
    title: item.title,
    condition: item.condition,
    city: item.city,
    area: item.area,
    desire_mode: item.desire_mode,
    desire_text: item.desire_text,
    categoryName: item.categories?.name_ar ?? null,
    imageUrl: item.item_images?.find((img: any) => img.is_primary)?.image_url ?? item.item_images?.[0]?.image_url ?? null,
  }));

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <SectionHeading title="الحاجات المعروضة" subtitle="تصفح إعلانات المقايضة الحقيقية في السوق." />
      {error ? <p className="rounded-xl bg-red-50 p-3 text-red-700">مش قادرين نكمل دلوقتي. جرّب تاني كمان شوية.</p> : null}
      {items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-8 text-center"><p>السوق الحقيقي لسه بيتبني. ابدأ بأول حاجة عندك، أو جرّب تشوف حاجتك ممكن تجيبلك إيه.</p><div className="mt-4 flex flex-wrap justify-center gap-3"><Link href="/discover" className="rounded-xl bg-clay px-5 py-3 text-white">شوف حاجتك ممكن تجيبلك إيه</Link><Link href="/items/new" className="rounded-xl border border-stone-300 px-5 py-3">اعرض حاجة</Link></div></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map((item) => <ItemCard key={item.id} item={item} />)}</div>
      )}
    </section>
  );
}
