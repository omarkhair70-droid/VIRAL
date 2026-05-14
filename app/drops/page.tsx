import Link from "next/link";
import { ItemCard } from "@/components/item-card";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import { HeroPanel, InlineNotice, PageSection, PageShell, SoftPanel, SurfaceCard } from "@/components/ui/surfaces";
import { createClient } from "@/lib/supabase/server";

type MaybeArray<T> = T | T[] | null | undefined;
function firstOrNull<T>(value: MaybeArray<T>): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

type ItemShape = {
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
  categories: { name_ar: string | null }[] | null;
  item_images: { image_url: string | null; is_primary: boolean | null }[] | null;
};

type FeaturedRow = { items: MaybeArray<ItemShape> };
type MotionRow = ItemShape & { offer_count: number | null };
type DropRow = { id: string; title: string; drop_type: string; creator_name: string | null; intro_copy: string; creator_drop_items: { sort_order: number; items: MaybeArray<{ id: string; title: string }> }[] | null };

export default async function DropsPage() {
  const supabase = await createClient();

  const [{ data: motion }, { data: featured }, { data: drops }] = await Promise.all([
    supabase
      .from("items")
      .select("id,title,condition,city,area,desire_mode,desire_text,item_story,swap_reason,good_for,categories(name_ar),item_images(image_url,is_primary),offer_count")
      .eq("status", "active")
      .gt("offer_count", 0)
      .order("offer_count", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("featured_story_items")
      .select("sort_order,created_at,items!inner(id,title,condition,city,area,desire_mode,desire_text,item_story,swap_reason,good_for,categories(name_ar),item_images(image_url,is_primary))")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false }),
    supabase
      .from("creator_drops")
      .select("id,title,drop_type,creator_name,intro_copy,creator_drop_items(sort_order,items!inner(id,title))")
      .eq("status", "published")
      .order("created_at", { ascending: false }),
  ]);

  const motionRows = (motion ?? []) as MotionRow[];
  const featuredRows = (featured ?? []) as unknown as FeaturedRow[];
  const dropRows = (drops ?? []) as unknown as DropRow[];

  const motionItems = motionRows.map((item) => ({
    ...item,
    categoryName: item.categories?.[0]?.name_ar ?? null,
    imageUrl: item.item_images?.find((img) => img.is_primary)?.image_url ?? item.item_images?.[0]?.image_url ?? null,
    hasStory: Boolean(item.item_story?.trim() || item.swap_reason?.trim() || item.good_for?.trim()),
  }));

  const featuredItems = featuredRows.flatMap((row) => {
    const item = firstOrNull(row.items);
    return item
      ? [{ ...item, categoryName: item.categories?.[0]?.name_ar ?? null, imageUrl: item.item_images?.find((img) => img.is_primary)?.image_url ?? item.item_images?.[0]?.image_url ?? null, hasStory: true }]
      : [];
  });

  const hasAny = motionItems.length > 0 || featuredItems.length > 0 || dropRows.length > 0;

  return (
    <PageShell className="max-w-6xl py-8 md:py-10">
      <PageSection className="space-y-6">
        <HeroPanel className="space-y-3 bg-[#f9efe2]">
          <p className="type-meta">حركة القيمة</p>
          <h1 className="type-hero">هنا تشوف تِسوى وهي بتتحرك</h1>
          <p className="type-body text-app-text-secondary">حاجات بدأت تستقبل اقتراحات، حكايات خرجت من الصمت، ودروب بتجمع زوايا غير متوقعة من العالم ده.</p>
          <p className="type-support">مش بنعرض أسرار العروض. بنعرض أثر إن القيمة بدأت تتحرك.</p>
        </HeroPanel>

        <InlineNotice tone="accent">تِسوى بتبين إن فيه حركة، مش تفاصيل الناس الخاصة. الرسائل والعروض نفسها تفضل بين أصحابها.</InlineNotice>

        {!hasAny ? (
          <EmptyState
            iconName="spark"
            title="لسه حركة القيمة هنا بتتكوّن."
            subtitle="أول ما تبدأ الحاجات تستقبل اقتراحات أو تظهر اختيارات جديدة، هتلاقي العالم ده بيتفتح هنا."
            action={
              <div className="flex flex-wrap items-center justify-center gap-2">
                <ButtonLink href="/items/new">اعرض حاجة</ButtonLink>
                <ButtonLink href="/items" variant="secondary">استكشف الاحتمالات</ButtonLink>
              </div>
            }
          />
        ) : null}

        {motionItems.length ? (
          <SurfaceCard className="space-y-4">
            <div className="space-y-2">
              <StatusPill tone="success">فيه اقتراحات وصلت</StatusPill>
              <h2 className="type-section-title">أبواب بدأت تتحرك</h2>
              <p className="type-support">الحاجات دي وصلها اهتمام فعلي. التفاصيل الخاصة تفضل بين أصحابها، لكن الحركة نفسها باينة.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {motionItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </SurfaceCard>
        ) : null}

        {featuredItems.length ? (
          <SurfaceCard className="space-y-4">
            <div>
              <h2 className="type-section-title">حاجات ليها حكاية</h2>
              <p className="type-support mt-1">بعض الحاجات تتحرك لأن وراءها معنى قبل أي اقتراح.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </SurfaceCard>
        ) : null}

        {dropRows.length > 0 ? (
          <SoftPanel className="space-y-4">
            <div>
              <h2 className="type-section-title">دروب بتجمع زوايا من تِسوى</h2>
              <p className="type-support mt-1">اختيارات منسقة حول مزاج أو فكرة، لا مجرد قوائم أشياء.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {dropRows.map((drop) => (
                <SurfaceCard key={drop.id} className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <StatusPill tone="pending">{drop.drop_type}</StatusPill>
                    {drop.creator_name ? <StatusPill>{drop.creator_name}</StatusPill> : null}
                  </div>
                  <h3 className="type-card-title">{drop.title}</h3>
                  <p className="text-sm text-app-text-secondary">{drop.intro_copy}</p>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {(drop.creator_drop_items ?? [])
                      .sort((a, b) => a.sort_order - b.sort_order)
                      .slice(0, 3)
                      .map((entry) => {
                        const linkedItem = firstOrNull(entry.items);
                        if (!linkedItem?.id) return null;
                        return (
                          <Link key={linkedItem.id} className="rounded-surface-compact border border-app-border bg-app-soft px-3 py-2 text-sm transition hover:bg-app-surface" href={`/items/${linkedItem.id}`}>
                            {linkedItem.title ?? "عنصر"}
                          </Link>
                        );
                      })}
                  </div>
                </SurfaceCard>
              ))}
            </div>
          </SoftPanel>
        ) : null}
      </PageSection>
    </PageShell>
  );
}
