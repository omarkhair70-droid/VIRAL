import Link from "next/link";
import { redirect } from "next/navigation";
import { OwnerItemCard } from "@/components/owner-item-card";
import { PageShell } from "@/components/page-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { createClient } from "@/lib/supabase/server";

type MaybeArray<T> = T | T[] | null | undefined;
function firstOrNull<T>(value: MaybeArray<T>): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

type ItemStatus = "active" | "archived" | "reserved" | "swapped" | "removed";

export default async function DashboardItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const tab = params.tab === "active" || params.tab === "archived" ? params.tab : "all";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard/items");

  const { data } = await supabase
    .from("items")
    .select("id,title,status,created_at,categories(name_ar),item_images(image_url,is_primary)")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  const items = (data ?? [])
    .map((item) => ({
      id: item.id,
      title: item.title,
      status: item.status as ItemStatus,
      created_at: item.created_at,
      categoryName: firstOrNull(item.categories)?.name_ar ?? null,
      imageUrl: item.item_images?.find((img) => img.is_primary)?.image_url ?? item.item_images?.[0]?.image_url ?? null,
    }))
    .filter((item) => (tab === "all" ? true : item.status === tab));

  return (
    <PageShell title="حاجاتي">
      <div className="mb-4 flex flex-wrap gap-2">
        <Link href="/dashboard/items" className="rounded-lg border px-3 py-1.5 text-sm">الكل</Link>
        <Link href="/dashboard/items?tab=active" className="rounded-lg border px-3 py-1.5 text-sm">نشطة</Link>
        <Link href="/dashboard/items?tab=archived" className="rounded-lg border px-3 py-1.5 text-sm">مؤرشفة</Link>
      </div>
      {items.length === 0 ? (
        <EmptyState iconName="publish" title="لسه ما عرضتش حاجات." subtitle="ابدأ بحاجة واحدة واضحة، وخليك واضح في الوصف." action={<Link href="/items/new" className="inline-flex rounded-lg bg-clay px-4 py-2 text-white">اعرض أول حاجة</Link>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">{items.map((item) => <OwnerItemCard key={item.id} item={item} />)}</div>
      )}
    </PageShell>
  );
}
