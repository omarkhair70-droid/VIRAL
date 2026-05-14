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

type SearchParams = Promise<{
  q?: string | string[];
  category?: string | string[];
  city?: string | string[];
  condition?: string | string[];
  sort?: string | string[];
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

function buildUrlWithCategory(category: string, params: { q: string; city: string; condition: Condition | null; sort: Sort }) {
  const nextParams = new URLSearchParams();
  if (params.q) nextParams.set("q", params.q);
  if (params.city) nextParams.set("city", params.city);
  if (params.condition) nextParams.set("condition", params.condition);
  if (params.sort !== "newest") nextParams.set("sort", params.sort);
  if (category) nextParams.set("category", category);
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

  const q = cleanText(qRaw, 80);
  const category = cleanText(categoryRaw, 80);
  const city = cleanText(cityRaw, 60);

  const hasFilters = Boolean(q || category || city || condition || sort !== "newest");

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

  if (q) {
    query = query.or(
      `title.ilike.%${q}%,description.ilike.%${q}%,desire_text.ilike.%${q}%,city.ilike.%${q}%,area.ilike.%${q}%`,
    );
  }

  if (category) {
    const matchedCategory = (categoriesData ?? []).find((row) => row.slug === category || row.id === category);
    if (matchedCategory) {
      query = query.eq("category_id", matchedCategory.id);
    }
  }

  if (city) {
    query = query.ilike("city", `%${city}%`);
  }

  if (condition) {
    query = query.eq("condition", condition);
  }

  if (sort === "oldest") {
    query = query.order("created_at", { ascending: true });
  } else if (sort === "title") {
    query = query.order("title", { ascending: true });
  } else {
    query = query.order("created_at", { ascending: false });
  }

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

  return (
    <PageShell className="max-w-6xl">
      <PageSection className="space-y-4">
        <SoftPanel className="space-y-3 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-app-text-primary">{hasFilters ? "نتائج البحث" : "السوق"}</h1>
              <p className="text-sm text-app-text-secondary">
                {hasFilters ? `لقينا ${items.length} إعلان مناسب للبحث بتاعك.` : "تصفح إعلانات المقايضة بسهولة واختر اللي يناسبك."}
              </p>
            </div>
            <ButtonLink href="/items/new" size="sm">
              اعرض حاجة
            </ButtonLink>
          </div>

          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            <Link
              href={buildUrlWithCategory("", { q, city, condition, sort }) as Route}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-sm ${!category ? "border-app-accent bg-app-accent text-white" : "border-app-border bg-app-surface text-app-text-secondary"}`}
            >
              الكل
            </Link>
            {(categoriesData ?? []).map((cat) => {
              const active = category === cat.slug || category === cat.id;
              return (
                <Link
                  key={cat.id}
                  href={buildUrlWithCategory(cat.slug, { q, city, condition, sort }) as Route}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-sm ${active ? "border-app-accent bg-app-accent text-white" : "border-app-border bg-app-surface text-app-text-secondary"}`}
                >
                  {cat.name_ar}
                </Link>
              );
            })}
          </div>
        </SoftPanel>

        <ItemSearchFilters
          categories={(categoriesData ?? []).map((row) => ({ id: row.id, name_ar: row.name_ar, slug: row.slug }))}
          values={{ q, category, city, condition: condition ?? "", sort }}
        />

        {hasFilters ? (
          <InlineNotice tone="accent" className="justify-between gap-2">
            <span>البحث متفلتر — {items.length} نتيجة.</span>
            <ButtonLink href="/items" size="compact" variant="quiet">
              امسح الفلاتر
            </ButtonLink>
          </InlineNotice>
        ) : null}

        {error ? <InlineNotice tone="danger">مش قادرين نحمّل السوق دلوقتي. جرّب تاني.</InlineNotice> : null}

        {items.length === 0 ? (
          <SoftPanel className="space-y-3 p-6 text-center">
            {hasFilters ? (
              <>
                <h2 className="text-xl font-semibold text-app-text-primary">مفيش نتائج بنفس الفلاتر دي.</h2>
                <p className="text-sm text-app-text-secondary">جرّب تخفف الفلاتر أو غيّر كلمات البحث، أو اعرض حاجة تناسب اللي الناس بتدور عليه.</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <ButtonLink href="/items" variant="secondary" size="sm">امسح الفلاتر</ButtonLink>
                  <ButtonLink href="/items/new" size="sm">اعرض حاجة</ButtonLink>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-app-text-primary">أول فرص المقايضة لسه مستنياك.</h2>
                <p className="text-sm text-app-text-secondary">ابدأ بإعلان واضح بالصور، وخلي أول مقايضة في السوق تبدأ منك.</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <ButtonLink href="/items/new" size="sm">اعرض حاجة</ButtonLink>
                  <ButtonLink href="/feed" variant="secondary" size="sm">شوف العروض</ButtonLink>
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
