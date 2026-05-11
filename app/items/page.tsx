import Link from "next/link";
import { ItemCard } from "@/components/item-card";
import { SectionHeading } from "@/components/section-heading";
import { EmptyStatePanel } from "@/components/ui/empty-state-panel";
import { createClient } from "@/lib/supabase/server";

type MaybeArray<T> = T | T[] | null | undefined;
function firstOrNull<T>(value: MaybeArray<T>): T | null { if (!value) return null; return Array.isArray(value) ? value[0] ?? null : value; }
type ItemListRawRow = { id: string; title: string; condition: "almost_new" | "good_used" | "minor_issues" | "needs_repair"; city: string | null; area: string | null; desire_mode: "specific" | "flexible" | "surprise"; desire_text: string | null; categories: MaybeArray<{ name_ar: string | null }>; item_images: Array<{ image_url: string | null; is_primary: boolean | null }> | null; };

export default async function ItemsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("items").select("id,title,condition,city,area,desire_mode,desire_text,categories(name_ar),item_images(image_url,is_primary)").eq("status", "active").order("created_at", { ascending: false });
  const items = ((data ?? []) as unknown as ItemListRawRow[]).map((item) => ({ ...item, categoryName: firstOrNull(item.categories)?.name_ar ?? null, imageUrl: item.item_images?.find((img) => img.is_primary)?.image_url ?? item.item_images?.[0]?.image_url ?? null }));

  return <section className="mx-auto max-w-6xl px-4 py-10"><SectionHeading title="السوق" subtitle="إعلانات حقيقية من ناس بتدور على مقايضة مفيدة." />{error ? <p className="rounded-xl bg-red-50 p-3 text-red-700">مش قادرين نحمّل السوق دلوقتي. جرّب تاني.</p> : null}{items.length === 0 ? <EmptyStatePanel title="السوق الحقيقي لسه بيتبني." subtitle="ابدأ بأول حاجة عندك، أو شوف الناس عارضة إيه." actions={<><Link href="/items/new" className="rounded-xl bg-clay px-5 py-3 text-white">اعرض حاجة</Link><Link href="/feed" className="rounded-xl border border-stone-300 px-5 py-3">شوف العروض</Link></>} /> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map((item) => <ItemCard key={item.id} item={item} />)}</div>}</section>;
}
