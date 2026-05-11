import Link from "next/link";

export function CategoryPill({ label }: { label: string }) {
  return (
    <Link href="/items" className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-gray-700 transition hover:border-clay hover:text-clay">
      {label}
    </Link>
  );
}
