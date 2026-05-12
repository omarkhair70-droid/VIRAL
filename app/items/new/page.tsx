import { randomUUID } from "crypto";
import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import { PageHeading } from "@/components/ui/page-heading";
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
      <PageHeading title="اعرض حاجة للمقايضة" subtitle="هنمشي خطوة خطوة: صور، تفاصيل واضحة، حكاية بسيطة، وبعدها راجع وانشر." />
      {params.error ? <Alert variant="danger">مش قادرين نكمل دلوقتي. جرّب تاني كمان شوية.</Alert> : null}
      {categoriesError ? <Alert variant="danger">مش قادرين نحمّل التصنيفات دلوقتي. جرّب تاني كمان شوية.</Alert> : null}
      {!user ? (
        <Alert variant="warning">ممكن تجهز الإعلان الأول، ولما تدوس نشر لازم تسجل دخول. <Link href="/login?next=/items/new" className="underline">سجّل دخول</Link></Alert>
      ) : null}
      <ItemForm categories={categories ?? []} prefill={params.prefill ?? ""} action={createItem} authRequired={!user} userId={user?.id ?? null} draftItemId={draftItemId} />
    </section>
  );
}
