import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const conditionLabels: Record<string, string> = { almost_new: "جديد تقريبًا", good_used: "مستخدم بحالة كويسة", minor_issues: "فيه عيوب بسيطة", needs_repair: "محتاج تصليح / عارف حالته" };
const desireLabels: Record<string, string> = { specific: "بدور على حاجة معينة", flexible: "عندي حاجات في بالي، بس فاجئني", surprise: "فاجئني تمامًا" };

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

  const imageUrl = item.item_images?.find((img: any) => img.is_primary)?.image_url ?? item.item_images?.[0]?.image_url;
  const owner: any = item.profiles;

  return (
    <section className="mx-auto max-w-4xl space-y-4 px-4 py-10">
      {imageUrl ? <img src={imageUrl} alt={item.title} className="aspect-video w-full rounded-2xl object-cover" /> : null}
      <h1 className="text-3xl font-bold">{item.title}</h1>
      <p>{item.categories?.name_ar ?? "بدون تصنيف"}</p>
      <p>{conditionLabels[item.condition]}</p>
      {item.condition_notes ? <p>{item.condition_notes}</p> : null}
      {item.description ? <p>{item.description}</p> : null}
      {(item.city || item.area) ? <p>{[item.city, item.area].filter(Boolean).join(" - ")}</p> : null}
      <p>{desireLabels[item.desire_mode]}</p>
      {item.desire_text ? <p>{item.desire_text}</p> : null}
      {item.item_wanted_tags?.length ? <div className="flex flex-wrap gap-2">{item.item_wanted_tags.map((t: any) => <span key={t.tag} className="rounded-full bg-stone-100 px-3 py-1 text-sm">{t.tag}</span>)}</div> : null}
      <div className="rounded-xl border border-stone-200 p-4"><h2 className="font-semibold">صاحب الإعلان</h2><p>{owner?.display_name ?? "مستخدم"}</p><p className="text-sm text-stone-600">{owner?.city ?? ""}</p><p className="text-sm text-stone-600">عدد المقايضات الناجحة: {owner?.successful_swaps_count ?? 0}</p></div>
      <p className="text-sm text-stone-500">اتنشر يوم {new Date(item.created_at).toLocaleDateString("ar-EG")}</p>
      {user?.id === item.owner_id ? (
        <div className="rounded-xl bg-amber-50 p-3 text-amber-800">دي حاجتك أنت. التعديل هييجي في مرحلة جاية.</div>
      ) : (
        <Link href={`/offers/new?requestedItemId=${item.id}`} className="inline-block rounded-xl bg-clay px-5 py-3 text-white">اعرض عليها حاجة عندك</Link>
      )}
    </section>
  );
}
