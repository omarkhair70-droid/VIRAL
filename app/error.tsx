"use client";

import { Button, ButtonLink } from "@/components/ui/button";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-4xl items-center px-4 py-10 sm:py-14">
      <section className="w-full rounded-panel border border-app-border bg-app-surface p-panel-md shadow-[0_16px_36px_rgba(31,41,55,0.08)] sm:p-panel-lg">
        <p className="type-meta mb-3 text-app-accent">حصل عطل</p>
        <h1 className="type-page-title">حصلت مشكلة غير متوقعة.</h1>
        <p className="type-support mt-3 max-w-2xl">جرّب تحدّث الصفحة أو اضغط جرّب تاني. ولو المشكلة فضلت، ابعتلنا لقطة شاشة.</p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button onClick={reset} size="sm">جرّب تاني</Button>
          <ButtonLink href="/items" size="sm" variant="quiet">ارجع للسوق</ButtonLink>
        </div>
      </section>
    </main>
  );
}
