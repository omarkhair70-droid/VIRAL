import Link from "next/link";
import { ItemCard } from "@/components/item-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeading } from "@/components/ui/page-heading";
import { StatusPill } from "@/components/ui/status-pill";
import { createClient } from "@/lib/supabase/server";

type MaybeArray<T> = T | T[] | null | undefined;
function firstOrNull<T>(value: MaybeArray<T>): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

type FeaturedRow = { items: MaybeArray<{ id:string; title:string; condition:"almost_new"|"good_used"|"minor_issues"|"needs_repair"; city:string|null; area:string|null; desire_mode:"specific"|"flexible"|"surprise"; desire_text:string|null; item_story:string|null; swap_reason:string|null; good_for:string|null; categories:{name_ar:string|null}[]|null; item_images:{image_url:string|null; is_primary:boolean|null}[]|null }> };
type DropRow = { id:string; title:string; drop_type:string; creator_name:string|null; intro_copy:string; creator_drop_items:{ sort_order:number; items:MaybeArray<{id:string; title:string}> }[]|null };

export default async function DropsPage() {
  const supabase = await createClient();
  const { data: featured } = await supabase.from("featured_story_items").select("sort_order,created_at,items!inner(id,title,condition,city,area,desire_mode,desire_text,item_story,swap_reason,good_for,categories(name_ar),item_images(image_url,is_primary))").order("sort_order", { ascending: true }).order("created_at", { ascending: false });
  const { data: drops } = await supabase.from("creator_drops").select("id,title,drop_type,creator_name,intro_copy,creator_drop_items(sort_order,items!inner(id,title))").eq("status", "published").order("created_at", { ascending: false });
  const featuredRows = (featured ?? []) as unknown as FeaturedRow[];
  const dropRows = (drops ?? []) as unknown as DropRow[];
  const featuredItems = featuredRows.flatMap((row) => { const item = firstOrNull(row.items); return item ? [{ ...item, categoryName: item.categories?.[0]?.name_ar ?? null, imageUrl: item.item_images?.find((img) => img.is_primary)?.image_url ?? item.item_images?.[0]?.image_url ?? null, hasStory: true }] : []; });
  const hasAny = featuredItems.length > 0 || dropRows.length > 0;
  return <section className="mx-auto max-w-6xl space-y-6 px-4 py-10"><PageHeading title="حاجات مش مجرد إعلان." subtitle="اختيارات ليها حكاية، ودروب متجمعة بعناية." />
    {!hasAny ? <EmptyState title="التحضير جاري" subtitle="بنجهّز اختيارات ودروب متجمعة بعناية قريب." /> : null}
    {featuredItems.length ? <div className="space-y-3"><h2 className="text-xl font-semibold">حاجات ليها حكاية</h2><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{featuredItems.map((item) => <ItemCard key={item.id} item={item} />)}</div></div> : null}
    {dropRows.length > 0 ? <div className="space-y-3"><h2 className="text-xl font-semibold">الدروب</h2><div className="space-y-4">{dropRows.map((drop) => <Card key={drop.id}><CardHeader><div className="flex gap-2"><StatusPill tone="pending">{drop.drop_type}</StatusPill>{drop.creator_name ? <StatusPill>{drop.creator_name}</StatusPill> : null}</div><CardTitle>{drop.title}</CardTitle></CardHeader><CardContent><p className="mb-3 text-sm text-stone-700">{drop.intro_copy}</p><div className="grid gap-2 sm:grid-cols-3">{(drop.creator_drop_items ?? []).sort((a,b)=>a.sort_order-b.sort_order).slice(0,3).map((entry) => { const linkedItem = firstOrNull(entry.items); if (!linkedItem?.id) return null; return <Link className="rounded-lg border p-2 text-sm" href={`/items/${linkedItem.id}`} key={linkedItem.id}>{linkedItem.title ?? "عنصر"}</Link>; })}</div></CardContent></Card>)}</div></div> : null}
  </section>;
}
