import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="hidden border-t border-gray-200 py-8 text-center text-sm text-gray-500 sm:block">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-5 px-4">
        <Link className="hover:text-ink" href="/how-it-works">إزاي بتشتغل</Link>
        <Link className="hover:text-ink" href="/safety">الأمان</Link>
        <Link className="hover:text-ink" href="/drops">الدروب</Link>
        <span className="text-muted">حاجتك لسه لها قيمة.</span>
      </div>
    </footer>
  );
}
