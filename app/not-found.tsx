import { ButtonLink } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-4xl items-center px-4 py-10 sm:py-14">
      <section className="w-full rounded-panel border border-app-border bg-app-surface p-panel-md shadow-[0_16px_36px_rgba(31,41,55,0.07)] sm:p-panel-lg">
        <p className="type-meta mb-3 text-app-accent">404 · حالة الصفحة</p>
        <h1 className="type-page-title">الصفحة دي مش موجودة.</h1>
        <p className="type-support mt-3 max-w-2xl">يمكن الرابط قديم، أو الحاجة دي اتشالت من السوق. جرّب ترجع وتتصفح من جديد.</p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <ButtonLink href="/items" size="sm">ارجع للسوق</ButtonLink>
          <ButtonLink href="/dashboard" size="sm" variant="quiet">الداشبورد</ButtonLink>
        </div>
      </section>
    </main>
  );
}
