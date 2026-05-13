import Link from "next/link";

export function PeopleDirectorySearch({ query }: { query: string }) {
  return (
    <form className="rounded-2xl border border-warmBorder bg-white p-4" action="/people" method="get">
      <label htmlFor="people-search" className="mb-2 block text-sm font-medium text-ink">دوّر على ناس بالاسم أو اليوزر أو المدينة</label>
      <div className="flex flex-wrap items-center gap-2">
        <input
          id="people-search"
          name="q"
          defaultValue={query}
          placeholder="مثال: القاهرة أو ahmed"
          className="h-11 min-w-[220px] flex-1 rounded-xl border border-warmBorder px-3 text-sm outline-none ring-0 focus:border-ink"
        />
        <button type="submit" className="h-11 rounded-xl bg-ink px-4 text-sm font-medium text-white">ابحث</button>
        {query ? <Link href="/people" className="text-sm text-muted underline underline-offset-2">مسح البحث</Link> : null}
      </div>
    </form>
  );
}
