import { randomUUID } from "crypto";
import Link from "next/link";
import { ItemForm } from "@/components/item-form";
import { InlineNotice, HeroPanel, PageSection, PageShell, SoftPanel } from "@/components/ui/surfaces";
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
    <PageShell className="max-w-3xl space-y-5">
      <PageSection>
        <HeroPanel className="space-y-2">
          <p className="text-xs font-medium text-app-text-muted">مش إعلان. احتمال.</p>
          <h1 className="text-2xl font-semibold text-app-text-primary">افتح للحاجة باب جديد</h1>
          <p className="text-sm text-app-text-secondary">صورها، قول حقيقتها، احكي ليه خرجت من حياتك، وسيب الناس تقول هي شايفاها تِسوى إيه.</p>
        </HeroPanel>
        <SoftPanel>
          <p className="text-sm text-app-text-secondary">مش لازم تكون الحاجة نادرة أو غالية. المهم إنك تعرضها بصدق وتسيب الباب مفتوحًا لقراءات جديدة.</p>
        </SoftPanel>
      </PageSection>

      {params.error ? <InlineNotice tone="danger">مش قادرين نكمل دلوقتي. جرّب تاني كمان شوية.</InlineNotice> : null}
      {categoriesError ? <InlineNotice tone="danger">مش قادرين نحمّل التصنيفات دلوقتي. جرّب تاني كمان شوية.</InlineNotice> : null}
      {!user ? (
        <InlineNotice tone="warning">ممكن تجهّز الحاجة كلها الأول، ولما تفتح لها باب العروض هتحتاج تسجّل دخول. <Link href="/login?next=/items/new" className="underline">سجّل دخول</Link></InlineNotice>
      ) : null}

      <ItemForm categories={categories ?? []} prefill={params.prefill ?? ""} action={createItem} authRequired={!user} userId={user?.id ?? null} draftItemId={draftItemId} />
    </PageShell>
  );
}
