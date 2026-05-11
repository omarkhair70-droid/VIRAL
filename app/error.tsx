"use client";

import Link from "next/link";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-bold">حصلت مشكلة غير متوقعة.</h1>
      <p className="text-sm text-stone-600">جرّب تحدّث الصفحة، ولو المشكلة فضلت ابعتلنا لقطة شاشة.</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button onClick={reset} className="rounded-lg bg-clay px-4 py-2 text-sm text-white">جرّب تاني</button>
        <Link href="/items" className="text-sm text-stone-700 underline">ارجع للسوق</Link>
      </div>
    </main>
  );
}
