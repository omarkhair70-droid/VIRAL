import Link from "next/link";
import { redirect } from "next/navigation";
import { OwnerItemCard } from "@/components/owner-item-card";
import { PageShell } from "@/components/page-shell";
import { ButtonLink } from "@/components/ui/button";
import { CountBadge } from "@/components/ui/product-primitives";
import { HeroPanel, PageSection, SoftPanel } from "@/components/ui/surfaces";
import { createClient } from "@/lib/supabase/server";

type MaybeArray<T> = T | T[] | null | undefined;
const firstOrNull = <T,>(value: MaybeArray<T>): T | null => !value ? null : Array.isArray(value) ? value[0] ?? null : value;
type ItemStatus = "active" | "archived" | "reserved" | "swapped" | "removed";
const chipClass = (isActive: boolean) =>
  `rounded-full border px-3 py-1.5 text-sm transition ${isActive ? "border-clay bg-app-accent-soft text-app-text-primary" : "border-app-border bg-app-surface text-app-text-secondary"}`;

export default async function DashboardItemsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const params = await searchParams;
  const tab = params.tab === "active" || params.tab === "archived" ? params.tab : "all";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/items");
  const { data } = await supabase.from("items").select("id,title,status,created_at,categories(name_ar),item_images(image_url,is_primary)").eq("owner_id", user.id).order("created_at", { ascending: false });
  const items = (data ?? []).map((item) => ({ id: item.id, title: item.title, status: item.status as ItemStatus, created_at: item.created_at, categoryName: firstOrNull(item.categories)?.name_ar ?? null, imageUrl: item.item_images?.find((img) => img.is_primary)?.image_url ?? item.item_images?.[0]?.image_url ?? null })).filter((item) => (tab === "all" ? true : item.status === tab));

  return <PageShell title="حاجاتي"><PageSection>
    <HeroPanel><h1 className="text-2xl font-semibold">حاجاتي</h1><p className="mt-1 text-sm text-app-text-secondary">إدارة إعلاناتك ومتابعة حالتها بسرعة.</p></HeroPanel>
    <SoftPanel className="flex flex-wrap items-center gap-2"><Link href="/dashboard/items" className={chipClass(tab === "all")}>الكل</Link><Link href="/dashboard/items?tab=active" className={chipClass(tab === "active")}>نشطة</Link><Link href="/dashboard/items?tab=archived" className={chipClass(tab === "archived")}>مؤرشفة</Link><span className="ms-auto flex items-center gap-2 text-sm text-app-text-muted">النتايج <CountBadge count={items.length} /></span></SoftPanel>
    {items.length === 0 ? <SoftPanel><p className="font-semibold">لسه ما عرضتش حاجات.</p><p className="mt-1 text-sm text-app-text-muted">ابدأ بحاجة واحدة واضحة وخليك دقيق في الصور والوصف.</p><ButtonLink href="/items/new" size="sm" className="mt-3">اعرض أول حاجة</ButtonLink></SoftPanel> : <div className="grid gap-4 md:grid-cols-2">{items.map((item) => <OwnerItemCard key={item.id} item={item} />)}</div>}
  </PageSection></PageShell>;
}
