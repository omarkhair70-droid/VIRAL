import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="hidden border-t border-app-border bg-app-soft/60 py-8 text-center sm:block">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-5 px-4">
        <Link className="type-support transition-colors duration-200 hover:text-app-text-primary motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-focus focus-visible:ring-offset-2" href="/how-it-works">إزاي بتشتغل</Link>
        <Link className="type-support transition-colors duration-200 hover:text-app-text-primary motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-focus focus-visible:ring-offset-2" href="/safety">الأمان</Link>
        <Link className="type-support transition-colors duration-200 hover:text-app-text-primary motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-focus focus-visible:ring-offset-2" href="/drops">الدروب</Link>
        <span className="type-meta text-app-text-muted">حاجتك لسه لها قيمة.</span>
      </div>
    </footer>
  );
}
