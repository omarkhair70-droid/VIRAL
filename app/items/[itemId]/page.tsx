import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type MaybeArray<T> = T | T[] | null | undefined;

function firstOrNull<T>(value: MaybeArray<T>): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

type ItemImageRow = {
  image_url: string | null;
  is_primary: boolean | null;
};

type WantedTagRow = {
  tag: string;
};

type CategoryRow = {
  name_ar: string | null;
};

type OwnerProfileRow = {
  display_name: string | null;
  city: string | null;
  successful_swaps_count: number | null;
};

type ItemDetailRawRow = {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  condition: "almost_new" | "good_used" | "minor_issues" | "needs_repair";
  condition_notes: string | null;
  city: string | null;
  area: string | null;
  desire_mode: "specific" | "flexible" | "surprise";
  desire_text: string | null;
  created_at: string;
  categories: MaybeArray<CategoryRow>;
  item_images: ItemImageRow[] | null;
  item_wanted_tags: WantedTagRow[] | null;
  profiles: MaybeArray<OwnerProfileRow>;
};

const conditionLabels: Record<ItemDetailRawRow["condition"], string> = { almost_new: "جديد تقريبًا", good_used: "مستخدم بحالة كويسة", minor_issues: "فيه عيوب بسيطة", needs_repair: "محتاج تصليح / عارف حالته" };
const desireLabels: Record<ItemDetailRawRow["desire_mode"], string> = { specific: "بدور على حاجة معينة", flexible: "عندي حاجات في بالي، بس فاجئني", surprise: "فاجئني تمامًا" };

export default async function ItemDetailPage({ params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: item, error } = await supabase
    .from("items")
    .select("id,owner_id,title,description,condition,condition_notes,city,area,desire_mode,desire_text,created_at,categories(name_ar),item_images(image_url,is_primary),item_wanted_tags(tag),profiles!items_owner_id_fkey(display_name,city,successful_swaps_count)")
    .eq("id", itemId)
    .eq("status", "active")
    .single();

  if (error || !item) notFound();

  const typedItem = item as unknown as ItemDetailRawRow;

  const imageUrl =
    typedItem.item_images?.find((img) => img.is_primary)?.image_url ??
    typedItem.item_images?.[0]?.image_url ??
    null;
  const category = firstOrNull(typedItem.categories);
  const owner = firstOrNull(typedItem.profiles);

  return (
    <section className="mx-auto max-w-4xl space-y-4 px-4 py-10">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={typedItem.title} className="aspect-video w-full rounded-2xl object-cover" />
      ) : null}
      <h1 className="text-3xl font-bold">{typedItem.title}</h1>
      <p>{category?.name_ar ?? "بدون تصنيف"}</p>
      <p>{conditionLabels[typedItem.condition]}</p>
      {typedItem.condition_notes ? <p>{typedItem.condition_notes}</p> : null}
      {typedItem.description ? <p>{typedItem.description}</p> : null}
      {(typedItem.city || typedItem.area) ? <p>{[typedItem.city, typedItem.area].filter(Boolean).join(" - ")}</p> : null}
      <p>{desireLabels[typedItem.desire_mode]}</p>
      {typedItem.desire_text ? <p>{typedItem.desire_text}</p> : null}
      {typedItem.item_wanted_tags?.length ? <div className="flex flex-wrap gap-2">{typedItem.item_wanted_tags.map((tag) => <span key={tag.tag} className="rounded-full bg-stone-100 px-3 py-1 text-sm">{tag.tag}</span>)}</div> : null}
      <div className="rounded-xl border border-stone-200 p-4"><h2 className="font-semibold">صاحب الإعلان</h2><p>{owner?.display_name ?? "مستخدم"}</p><p className="text-sm text-stone-600">{owner?.city ?? ""}</p><p className="text-sm text-stone-600">عدد المقايضات الناجحة: {owner?.successful_swaps_count ?? 0}</p></div>
      <p className="text-sm text-stone-500">اتنشر يوم {new Date(typedItem.created_at).toLocaleDateString("ar-EG")}</p>
      {user?.id === typedItem.owner_id ? (
        <div className="rounded-xl bg-amber-50 p-3 text-amber-800">دي حاجتك أنت. التعديل هييجي في مرحلة جاية.</div>
      ) : (
        <Link href={`/offers/new?requestedItemId=${typedItem.id}`} className="inline-block rounded-xl bg-clay px-5 py-3 text-white">اعرض عليها حاجة عندك</Link>
      )}
    </section>
  );
}
