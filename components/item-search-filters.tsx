import { Button, ButtonLink } from "@/components/ui/button";
import { FormActions, Select, TextInput } from "@/components/ui/form";
import { SoftPanel } from "@/components/ui/surfaces";
import { TESWA_CONDITION_LANGUAGE } from "@/lib/teswa-product-language";

type CategoryOption = {
  id: string;
  name_ar: string;
  slug: string;
};

type Condition = "almost_new" | "good_used" | "minor_issues" | "needs_repair";
type Sort = "newest" | "oldest" | "title";
type ExploreWorld = "all" | "open" | "story" | "specific";

type ItemSearchFiltersProps = {
  categories: CategoryOption[];
  values: {
    q: string;
    category: string;
    city: string;
    condition: Condition | "";
    sort: Sort;
    world: ExploreWorld;
  };
};

export function ItemSearchFilters({ categories, values }: ItemSearchFiltersProps) {
  const hasAdvanced = Boolean(values.category || values.city || values.condition);

  return (
    <SoftPanel className="space-y-3 p-4">
      <form action="/items" method="get" className="space-y-3">
        {values.world !== "all" ? <input type="hidden" name="world" value={values.world} /> : null}
        {values.sort !== "newest" ? <input type="hidden" name="sort" value={values.sort} /> : null}

        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-app-text-primary">في حاجة أو فكرة في بالك؟</h2>
          <p className="text-xs text-app-text-secondary">دوّر أو ضيّق الاحتمالات، من غير ما تبدأ من كتالوج جامد.</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <TextInput name="q" defaultValue={values.q} placeholder="دوّر على حاجة أو فكرة…" className="sm:flex-1" />
          <Button type="submit" size="sm">دوّر</Button>
        </div>

        <details className="rounded-xl border border-app-border bg-app-surface px-3 py-2" open={hasAdvanced}>
          <summary className="cursor-pointer text-sm font-medium text-app-text-secondary">ضيّق الاحتمالات</summary>
          <div className="mt-3 grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            <Select name="category" defaultValue={values.category}>
              <option value="">كل التصنيفات</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name_ar}
                </option>
              ))}
            </Select>
            <TextInput name="city" defaultValue={values.city} placeholder="المدينة" />
            <Select name="condition" defaultValue={values.condition}>
              <option value="">كل الحالات</option>
              <option value="almost_new">{TESWA_CONDITION_LANGUAGE.almost_new.label}</option>
              <option value="good_used">{TESWA_CONDITION_LANGUAGE.good_used.label}</option>
              <option value="minor_issues">{TESWA_CONDITION_LANGUAGE.minor_issues.label}</option>
              <option value="needs_repair">{TESWA_CONDITION_LANGUAGE.needs_repair.label}</option>
            </Select>
          </div>
        </details>

        <FormActions>
          <Button type="submit" variant="secondary" size="sm">طبّق</Button>
          <ButtonLink href={values.world === "all" ? "/items" : `/items?world=${values.world}`} variant="quiet" size="sm">امسح التضييق</ButtonLink>
        </FormActions>
      </form>
    </SoftPanel>
  );
}
