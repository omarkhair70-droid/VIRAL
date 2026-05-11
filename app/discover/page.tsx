import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function DiscoverPage({ searchParams }: { searchParams: Promise<{ item?: string }> }) {
  const params = await searchParams;
  const item = params.item?.trim() ?? "";
  const supabase = await createClient();

  let examples: Array<{ id: string; title: string; description: string | null; requested_label: string | null; offered_label: string | null; is_real: boolean }> = [];
  if (item) {
    const { data } = await supabase
      .from("discovery_examples")
      .select("id,title,description,requested_label,offered_label,is_real,query_term")
      .ilike("query_term", `%${item}%`)
      .limit(6);
    examples = data ?? [];
  }

  return (
    <section className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      <h1 className="text-3xl font-bold">إيه الحاجة اللي عندك؟</h1>
      <p className="text-stone-600">اكتب اسمها بس. مش هنقولك سعرها كام… هنوريك يمكن تتبدل بإيه.</p>
      <form action="/discover" className="flex gap-2">
        <input name="item" defaultValue={item} placeholder="سفرة، جاكيت، كاميرا قديمة، كرسي مكتب، مخدة فايبر…" className="flex-1 rounded-xl border border-stone-300 px-3 py-2" />
        <button className="rounded-xl bg-clay px-4 py-2 text-white">شوف الاحتمالات</button>
      </form>

      {item ? (
        <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="text-2xl font-semibold">{item}؟ دي مش لازم تتباع علشان تتحرك.</h2>
          <p className="text-stone-600">ممكن تكون مالهاش مشتري دلوقتي، بس يمكن تكون بالظبط اللي حد تاني بيدور عليه.</p>
          {examples.length ? (
            <div className="space-y-3">
              {examples.map((example) => (
                <article key={example.id} className="rounded-xl border border-stone-200 p-4">
                  <h3 className="font-semibold">{example.title}</h3>
                  {example.description ? <p className="text-sm text-stone-600">{example.description}</p> : null}
                  <p className="mt-1 text-sm">محتاج: {example.requested_label || "-"}</p>
                  <p className="text-sm">مقابل: {example.offered_label || "-"}</p>
                  {!example.is_real ? <span className="mt-2 inline-block rounded-full bg-stone-100 px-2 py-1 text-xs">أمثلة ممكنة</span> : null}
                </article>
              ))}
            </div>
          ) : (
            <p>لسه ماعندناش أمثلة كتير للحاجة دي. بس ده ممكن يخليها أول واحدة من نوعها هنا.</p>
          )}
          <div className="flex flex-wrap gap-2">
            <Link href={`/items/new?prefill=${encodeURIComponent(item)}`} className="rounded-xl bg-clay px-4 py-2 text-white">اعرضها للمقايضة</Link>
            <Link href="/discover" className="rounded-xl border border-stone-300 px-4 py-2">جرّب حاجة تانية</Link>
          </div>
        </div>
      ) : null}
    </section>
  );
}
