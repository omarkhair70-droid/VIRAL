
import { ItemCard } from "@/components/item-card";
import { ItemSearchFilters } from "@/components/item-search-filters";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeading } from "@/components/ui/page-heading";
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
    .select("id,title,condition,city,area,desire_mode,desire_text,categories(name_ar),item_images(image_url,is_primary)")
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

  const items = ((data ?? []) as unknown as ItemListRawRow[]).map((item) => ({
    ...item,
    categoryName: firstOrNull(item.categories)?.name_ar ?? null,
    imageUrl:
      item.item_images?.find((img) => img.is_primary)?.image_url ?? item.item_images?.[0]?.image_url ?? null,
  }));

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <PageHeading title={hasFilters ? "نتائج البحث" : "السوق"} subtitle={hasFilters ? `لقينا ${items.length} إعلان مناسب` : "إعلانات حقيقية من ناس بتدور على مقايضة مفيدة."} />

      <ItemSearchFilters
        categories={(categoriesData ?? []).map((row) => ({ id: row.id, name_ar: row.name_ar, slug: row.slug }))}
        values={{ q, category, city, condition: condition ?? "", sort }}
      />

      {error ? <Alert variant="danger">مش قادرين نحمّل السوق دلوقتي. جرّب تاني.</Alert> : null}

      {items.length === 0 ? (
        hasFilters ? (
          <EmptyState
            iconName="search"
            title="مفيش نتائج بنفس الفلاتر دي."
            subtitle="جرّب تخفف الفلاتر أو غيّر كلمات البحث. ولو عندك حاجة مناسبة اعرضها."
            secondaryAction={<ButtonLink href="/items" variant="secondary">امسح الفلاتر</ButtonLink>}
            action={<ButtonLink href="/items/new">اعرض حاجة</ButtonLink>}
          />
        ) : (
          <EmptyState
            iconName="empty-box"
            title="السوق الحقيقي لسه بيتبني."
            subtitle="ابدأ بأول حاجة عندك، أو شوف الناس عارضة إيه."
            action={<ButtonLink href="/items/new">اعرض حاجة</ButtonLink>}
            secondaryAction={<ButtonLink href="/feed" variant="secondary">شوف العروض</ButtonLink>}
          />
        )
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
