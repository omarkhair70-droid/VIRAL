import { randomUUID } from "crypto";
import Link from "next/link";
import { ItemForm } from "@/components/item-form";
import { createClient } from "@/lib/supabase/server";
import { createItem } from "./actions";

export default async function NewItemPage({ searchParams }: { searchParams: Promise<{ prefill?: string; error?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const draftItemId = randomUUID();

  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("id,name_ar")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return (
    <section className="mx-auto max-w-3xl space-y-5 px-4 py-10">
      <h1 className="text-3xl font-bold">اعرض حاجة للمقايضة</h1>
      {params.error ? <p className="rounded-xl bg-red-50 p-3 text-red-700">مش قادرين نكمل دلوقتي. جرّب تاني كمان شوية.</p> : null}
      {categoriesError ? <p className="rounded-xl bg-red-50 p-3 text-red-700">مش قادرين نحمّل التصنيفات دلوقتي. جرّب تاني كمان شوية.</p> : null}
      {!user ? (
        <p className="rounded-xl bg-amber-50 p-3 text-amber-800">ممكن تجهز الإعلان الأول، ولما تدوس نشر لازم تسجل دخول. <Link href="/login?next=/items/new" className="underline">سجّل دخول</Link></p>
      ) : null}
      <ItemForm categories={categories ?? []} prefill={params.prefill ?? ""} action={createItem} authRequired={!user} userId={user?.id ?? null} draftItemId={draftItemId} />
    </section>
  );
}
