import Link from "next/link";
import { ItemCard } from "@/components/item-card";
import { SectionHeading } from "@/components/section-heading";
import { createClient } from "@/lib/supabase/server";

type MaybeArray<T> = T | T[] | null | undefined;

function firstOrNull<T>(value: MaybeArray<T>): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

type ItemListRawRow = {
  id: string;
  title: string;
  condition: "almost_new" | "good_used" | "minor_issues" | "needs_repair";
  city: string | null;
  area: string | null;
  desire_mode: "specific" | "flexible" | "surprise";
  desire_text: string | null;
  item_story: string | null;
  swap_reason: string | null;
  good_for: string | null;
  categories: MaybeArray<{ name_ar: string | null }>;
  item_images: Array<{ image_url: string | null; is_primary: boolean | null }> | null;
};

export default async function DiscoverPage({ searchParams }: { searchParams: Promise<{ item?: string }> }) {
  const params = await searchParams;
  const item = (params.item ?? "").trim().slice(0, 80);
  const supabase = await createClient();

  let examples: Array<{
    id: string;
    title: string;
    description: string | null;
    requested_label: string | null;
    offered_label: string | null;
    is_real: boolean;
  }> = [];

  let realItems: Array<ItemListRawRow & { categoryName: string | null; imageUrl: string | null }> = [];

  if (item) {
    const [{ data: examplesData }, { data: realData }] = await Promise.all([
      supabase
        .from("discovery_examples")
        .select("id,title,description,requested_label,offered_label,is_real,query_term")
        .ilike("query_term", `%${item}%`)
        .limit(6),
      supabase
        .from("items")
        .select("id,title,condition,city,area,desire_mode,desire_text,item_story,swap_reason,good_for,categories(name_ar),item_images(image_url,is_primary)")
        .eq("status", "active")
        .or(`title.ilike.%${item}%,description.ilike.%${item}%,desire_text.ilike.%${item}%,city.ilike.%${item}%,area.ilike.%${item}%`)
        .order("created_at", { ascending: false })
        .limit(6),
    ]);

    examples = examplesData ?? [];
    realItems = ((realData ?? []) as ItemListRawRow[]).map((it) => ({
      ...it,
      categoryName: firstOrNull(it.categories)?.name_ar ?? null,
      imageUrl: it.item_images?.find((img) => img.is_primary)?.image_url ?? it.item_images?.[0]?.image_url ?? null,
      hasStory: Boolean(it.item_story || it.swap_reason || it.good_for),
    }));
  }

  return (
    <section className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <SectionHeading title="إيه الحاجة اللي عندك؟" subtitle="اكتب اسمها بس. مش هنقولك سعرها كام… هنوريك يمكن تتبدل بإيه." />
      <form action="/discover" className="flex gap-2">
        <input
          name="item"
          defaultValue={item}
          placeholder="سفرة، جاكيت، كاميرا قديمة، كرسي مكتب، مخدة فايبر…"
          className="flex-1 rounded-xl border border-stone-300 px-3 py-2"
        />
        <button className="rounded-xl bg-clay px-4 py-2 text-white">شوف الاحتمالات</button>
      </form>

      {item ? (
        <div className="space-y-5 rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="text-2xl font-semibold">{item}؟ دي مش لازم تتباع علشان تتحرك.</h2>
          <p className="text-stone-600">ممكن تكون مالهاش مشتري دلوقتي، بس يمكن تكون بالظبط اللي حد تاني بيدور عليه.</p>

          <div className="space-y-3">
            <h3 className="text-xl font-semibold">أفكار وأمثلة ممكنة</h3>
            {examples.length ? (
              <div className="space-y-3">
                {examples.map((example) => (
                  <article key={example.id} className="rounded-xl border border-stone-200 p-4">
                    <h4 className="font-semibold">{example.title}</h4>
                    {example.description ? <p className="text-sm text-stone-600">{example.description}</p> : null}
                    <p className="mt-1 text-sm">محتاج: {example.requested_label || "-"}</p>
                    <p className="text-sm">مقابل: {example.offered_label || "-"}</p>
                    {!example.is_real ? (
                      <span className="mt-2 inline-block rounded-full bg-stone-100 px-2 py-1 text-xs">أمثلة ممكنة</span>
                    ) : (
                      <span className="mt-2 inline-block rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-800">من مقايضات حقيقية</span>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <p>لسه ماعندناش أمثلة كتير للحاجة دي. بس ده ممكن يخليها أول واحدة من نوعها هنا.</p>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="text-xl font-semibold">حاجات موجودة فعلًا ممكن تناسبك</h3>
            {realItems.length ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {realItems.map((realItem) => (
                    <ItemCard key={realItem.id} item={realItem} />
                  ))}
                </div>
                <Link href={`/items?q=${encodeURIComponent(item)}`} className="inline-flex rounded-xl border border-stone-300 px-4 py-2">
                  شوف نتائج أكتر في السوق
                </Link>
              </>
            ) : (
              <p>لسه مفيش حاجات حقيقية مطابقة، بس تقدر تكون أول واحد يعرض حاجة شبه دي.</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href={`/items/new?prefill=${encodeURIComponent(item)}`} className="rounded-xl bg-clay px-4 py-2 text-white">
              اعرضها للمقايضة
            </Link>
            <Link href="/discover" className="rounded-xl border border-stone-300 px-4 py-2">
              جرّب حاجة تانية
            </Link>
          </div>
        </div>
      ) : null}
    </section>
  );
}
