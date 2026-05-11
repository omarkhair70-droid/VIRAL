import Link from "next/link";

type CategoryOption = {
  id: string;
  name_ar: string;
  slug: string;
};

type Condition = "almost_new" | "good_used" | "minor_issues" | "needs_repair";
type Sort = "newest" | "oldest" | "title";

type ItemSearchFiltersProps = {
  categories: CategoryOption[];
  values: {
    q: string;
    category: string;
    city: string;
    condition: Condition | "";
    sort: Sort;
  };
};

export function ItemSearchFilters({ categories, values }: ItemSearchFiltersProps) {
  return (
    <form action="/items" method="get" className="mb-6 rounded-2xl border border-stone-200 bg-white p-4">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
        <input
          name="q"
          defaultValue={values.q}
          placeholder="دور على حاجة..."
          className="rounded-xl border border-stone-300 px-3 py-2"
        />
        <select name="category" defaultValue={values.category} className="rounded-xl border border-stone-300 px-3 py-2">
          <option value="">كل التصنيفات</option>
          {categories.map((category) => (
            <option key={category.id} value={category.slug}>
              {category.name_ar}
            </option>
          ))}
        </select>
        <input
          name="city"
          defaultValue={values.city}
          placeholder="المدينة"
          className="rounded-xl border border-stone-300 px-3 py-2"
        />
        <select
          name="condition"
          defaultValue={values.condition}
          className="rounded-xl border border-stone-300 px-3 py-2"
        >
          <option value="">كل الحالات</option>
          <option value="almost_new">جديد تقريبًا</option>
          <option value="good_used">مستخدم بحالة كويسة</option>
          <option value="minor_issues">فيه عيوب بسيطة</option>
          <option value="needs_repair">محتاج تصليح / عارف حالته</option>
        </select>
        <select name="sort" defaultValue={values.sort} className="rounded-xl border border-stone-300 px-3 py-2">
          <option value="newest">الأحدث</option>
          <option value="oldest">الأقدم</option>
          <option value="title">العنوان (أ-ي)</option>
        </select>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button className="rounded-xl bg-clay px-4 py-2 text-white">فلتر</button>
        <Link href="/items" className="rounded-xl border border-stone-300 px-4 py-2">
          امسح الفلاتر
        </Link>
      </div>
    </form>
  );
}
