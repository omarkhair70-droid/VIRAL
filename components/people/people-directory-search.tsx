import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SoftPanel } from "@/components/ui/surfaces";

export function PeopleDirectorySearch({ query }: { query: string }) {
  return (
    <SoftPanel>
      <form action="/people" method="get" className="space-y-3">
        <label htmlFor="people-search" className="type-meta block text-app-text-secondary">
          دور على ناس بالاسم أو اليوزر أو المدينة
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <input
            id="people-search"
            name="q"
            defaultValue={query}
            placeholder="مثال: القاهرة أو ahmed"
            className="min-h-11 min-w-[220px] flex-1 rounded-button border border-app-border bg-app-surface px-3 text-sm text-app-text-primary outline-none transition focus:border-app-accent focus:ring-2 focus:ring-app-focus"
          />
          <Button type="submit" size="md">ابحث</Button>
          {query ? (
            <Link href="/people" className="text-sm text-app-text-muted underline decoration-app-border underline-offset-4 hover:text-app-text-primary">
              مسح البحث
            </Link>
          ) : null}
        </div>
      </form>
    </SoftPanel>
  );
}
