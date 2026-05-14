import Link from "next/link";
import type { Route } from "next";
import { ItemCard } from "@/components/item-card";
import { ItemSearchFilters } from "@/components/item-search-filters";
import { ButtonLink } from "@/components/ui/button";
import { InlineNotice, PageSection, PageShell, SoftPanel } from "@/components/ui/surfaces";
import { createClient } from "@/lib/supabase/server";

type MaybeArray<T> = T | T[] | null | undefined;

type Condition = "almost_new" | "good_used" | "minor_issues" | "needs_repair";
type Sort = "newest" | "oldest" | "title";
type ExploreWorld = "all" | "open" | "story" | "specific";

type SearchParams = Promise<{
  q?: string | string[];
  category?: string | string[];
  city?: string | string[];
  condition?: string | string[];
  sort?: string | string[];
  world?: string | string[];
}>;

type ItemListRawRow = {
  id: string;
  title: string;
  condition: Condition;
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

type DiscoveryWorld = { key: ExploreWorld; label: string; description: string };

const DISCOVERY_WORLDS: DiscoveryWorld[] = [
  { key: "all", label: "كل الاحتمالات", description: "لفّة مفتوحة على كل الحاجات اللي لها باب عروض." },
  { key: "open", label: "فاتحين باب المفاجآت", description: "أصحابها سايبين مساحة للناس تقول هي شايفاها تِسوى إيه." },
  { key: "story", label: "ليها حكاية", description: "حاجات مش بتتشرح بعنوان وصورة بس." },
  { key: "specific", label: "أصحابها عارفين اتجاههم", description: "حاجات أصحابها مستنيين نوع عرض أقرب لفكرة في بالهم." },
];

function firstOrNull<T>(value: MaybeArray<T>): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

function cleanText(value: string | null, maxLength: number): string {
  if (!value) return "";
  return value.trim().slice(0, maxLength);
}

function parseCondition(value: string | null): Condition | null {
  if (!value) return null;
  if (value === "almost_new" || value === "good_used" || value === "minor_issues" || value === "needs_repair") {
    return value;
  }
  return null;
}

function parseSort(value: string | null): Sort {
  if (value === "oldest" || value === "title") return value;
  return "newest";
}

function parseExploreWorld(value: string | null): ExploreWorld {
  if (value === "open" || value === "story" || value === "specific") return value;
  return "all";
}

function buildItemsUrl(params: { q: string; category: string; city: string; condition: Condition | null; sort: Sort; world: ExploreWorld }) {
  const nextParams = new URLSearchParams();
  if (params.world !== "all") nextParams.set("world", params.world);
  if (params.q) nextParams.set("q", params.q);
  if (params.category) nextParams.set("category", params.category);
  if (params.city) nextParams.set("city", params.city);
  if (params.condition) nextParams.set("condition", params.condition);
  if (params.sort !== "newest") nextParams.set("sort", params.sort);
  const serialized = nextParams.toString();
  return serialized ? `/items?${serialized}` : "/items";
}

export default async function ItemsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const qRaw = firstOrNull(params.q) ?? null;
  const categoryRaw = firstOrNull(params.category) ?? null;
  const cityRaw = firstOrNull(params.city) ?? null;
  const condition = parseCondition(firstOrNull(params.condition) ?? null);
  const sort = parseSort(firstOrNull(params.sort) ?? null);
  const world = parseExploreWorld(firstOrNull(params.world) ?? null);

  const q = cleanText(qRaw, 80);
  const category = cleanText(categoryRaw, 80);
  const city = cleanText(cityRaw, 60);

  const hasNarrowing = Boolean(q || category || city || condition);
  const hasLegacySort = sort !== "newest";
  const hasActiveWorld = world !== "all";
  const hasAnyConstraints = hasNarrowing || hasLegacySort || hasActiveWorld;

  const activeWorld = DISCOVERY_WORLDS.find((candidate) => candidate.key === world) ?? DISCOVERY_WORLDS[0];

  const supabase = await createClient();
  const { data: categoriesData } = await supabase
    .from("categories")
    .select("id,name_ar,slug")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  let query = supabase
    .from("items")
    .select("id,title,condition,city,area,desire_mode,desire_text,item_story,swap_reason,good_for,categories(name_ar),item_images(image_url,is_primary)")
    .eq("status", "active");

  if (world === "open") query = query.in("desire_mode", ["surprise", "flexible"]);
  if (world === "story") query = query.or("item_story.not.is.null,swap_reason.not.is.null,good_for.not.is.null");
  if (world === "specific") query = query.eq("desire_mode", "specific");

  if (q) {
    query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,desire_text.ilike.%${q}%,city.ilike.%${q}%,area.ilike.%${q}%`);
  }

  if (category) {
    const matchedCategory = (categoriesData ?? []).find((row) => row.slug === category || row.id === category);
    if (matchedCategory) query = query.eq("category_id", matchedCategory.id);
  }

  if (city) query = query.ilike("city", `%${city}%`);
  if (condition) query = query.eq("condition", condition);

  if (sort === "oldest") query = query.order("created_at", { ascending: true });
  else if (sort === "title") query = query.order("title", { ascending: true });
  else query = query.order("created_at", { ascending: false });

  const { data, error } = await query;

  const items = ((data ?? []) as unknown as ItemListRawRow[]).map((item) => {
    const images = [...(item.item_images ?? [])].sort((a, b) => Number(Boolean(b.is_primary)) - Number(Boolean(a.is_primary)));

    return {
      ...item,
      categoryName: firstOrNull(item.categories)?.name_ar ?? null,
      imageUrls: images.map((image) => image.image_url).filter((url): url is string => Boolean(url)),
      imageUrl: images.find((img) => img.is_primary)?.image_url ?? images[0]?.image_url ?? null,
      hasStory: Boolean(item.item_story || item.swap_reason || item.good_for),
    };
  });

  const resultTitle = hasNarrowing ? `${items.length} احتمال داخل في الزاوية دي.` : activeWorld.label;
  const resultSubtitle = hasNarrowing
    ? "لقينا حاجات قريبة من اختيارك — جرّب توسّع أو تغيّر الزاوية لو حابب."
    : activeWorld.key === "all"
      ? "حاجات فاتحة أبوابًا مختلفة، من غير ما تضطر تعرف أنت بدور على إيه من البداية."
      : activeWorld.description;

  return (
    <PageShell className="max-w-6xl">
      <PageSection className="space-y-4">
        <SoftPanel className="space-y-3 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-app-text-primary">استكشف الاحتمالات</h1>
              <p className="text-sm text-app-text-secondary">ادخل من الباب اللي يشدك: مفاجآت، حكايات، أو حاجات أصحابها عارفين تقريبًا مستنيين إيه.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <ButtonLink href="/items/new" size="sm">اعرض حاجة</ButtonLink>
              <ButtonLink href="/" size="sm" variant="secondary">ارجع للاحتمالات</ButtonLink>
            </div>
          </div>
        </SoftPanel>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {DISCOVERY_WORLDS.map((candidate) => {
            const href = buildItemsUrl({ q, category, city, condition, sort, world: candidate.key });
            const isActive = candidate.key === world;
            return (
              <Link
                key={candidate.key}
                href={href as Route}
                className={`rounded-2xl border p-4 transition ${isActive ? "border-app-accent bg-app-accent/10" : "border-app-border bg-app-surface hover:border-app-accent/50"}`}
              >
                <p className="text-sm font-semibold text-app-text-primary">{candidate.label}</p>
                <p className="mt-1 text-xs text-app-text-secondary">{candidate.description}</p>
              </Link>
            );
          })}
        </div>

        <ItemSearchFilters
          categories={(categoriesData ?? []).map((row) => ({ id: row.id, name_ar: row.name_ar, slug: row.slug }))}
          values={{ q, category, city, condition: condition ?? "", sort, world }}
        />

        <SoftPanel className="space-y-1 p-4">
          <h2 className="text-lg font-semibold text-app-text-primary">{resultTitle}</h2>
          <p className="text-sm text-app-text-secondary">{resultSubtitle}</p>
        </SoftPanel>

        {hasAnyConstraints ? (
          <InlineNotice tone="accent" className="justify-between gap-2">
            <span>
              {hasActiveWorld ? `زاوية الاستكشاف: ${activeWorld.label}` : "استكشاف مفتوح"}
              {q ? " • فيه بحث نصي" : ""}
              {category ? " • فيه تصنيف" : ""}
              {city ? " • فيه مدينة" : ""}
              {condition ? " • فيه حالة" : ""}
              {hasLegacySort ? " • ترتيب قديم محفوظ" : ""}
            </span>
            <div className="flex flex-wrap gap-2">
              {hasNarrowing || hasLegacySort ? (
                <ButtonLink
                  href={buildItemsUrl({ q: "", category: "", city: "", condition: null, sort: "newest", world }) as Route}
                  size="compact"
                  variant="quiet"
                >
                  امسح التضييق
                </ButtonLink>
              ) : null}
              {hasActiveWorld ? (
                <ButtonLink href="/items" size="compact" variant="quiet">ارجع لكل الاحتمالات</ButtonLink>
              ) : null}
            </div>
          </InlineNotice>
        ) : null}

        {error ? <InlineNotice tone="danger">مش قادرين نحمّل الاحتمالات دلوقتي. جرّب تاني.</InlineNotice> : null}

        {items.length === 0 ? (
          <SoftPanel className="space-y-3 p-6 text-center">
            {hasAnyConstraints ? (
              <>
                <h2 className="text-xl font-semibold text-app-text-primary">مفيش حاجات داخلة في الاختيار ده.</h2>
                <p className="text-sm text-app-text-secondary">جرّب ترجع لزاوية أوسع، أو اعرض حاجة تفتح باب جديد.</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <ButtonLink href="/items" variant="secondary" size="sm">وسّع الاستكشاف</ButtonLink>
                  <ButtonLink href="/items/new" size="sm">اعرض حاجة</ButtonLink>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-app-text-primary">لسه الاحتمالات هنا بتتفتح.</h2>
                <p className="text-sm text-app-text-secondary">اعرض أول حاجة، وسيب الناس تقول هي شايفاها تِسوى إيه.</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <ButtonLink href="/items/new" size="sm">اعرض حاجة</ButtonLink>
                  <ButtonLink href="/" variant="secondary" size="sm">ارجع للواجهة</ButtonLink>
                </div>
              </>
            )}
          </SoftPanel>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </PageSection>
    </PageShell>
  );
}
