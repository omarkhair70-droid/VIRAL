import Link from "next/link";

export default function InstallPage() {
  return (
    <section className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <div className="rounded-2xl border bg-white p-5">
        <h1 className="text-3xl font-bold">نزّل تِسوى على موبايلك</h1>
        <p className="mt-2 text-stone-700">تقدر تفتح تِسوى من الشاشة الرئيسية كأنه تطبيق، من غير App Store.</p>
      </div>

      <article className="rounded-2xl border bg-white p-5">
        <h2 className="text-xl font-semibold">Android / Chrome</h2>
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-stone-700">
          <li>افتح الموقع من Chrome</li><li>اضغط ⋮</li><li>اختار Add to Home screen أو Install app</li><li>افتح تِسوى من الأيقونة</li>
        </ul>
      </article>

      <article className="rounded-2xl border bg-white p-5">
        <h2 className="text-xl font-semibold">iPhone / Safari</h2>
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-stone-700">
          <li>افتح الموقع من Safari</li><li>اضغط زر المشاركة</li><li>اختار Add to Home Screen</li><li>اضغط Add</li>
        </ul>
      </article>

      <article className="rounded-2xl border bg-stone-50 p-5">
        <h2 className="text-xl font-semibold">ملاحظات</h2>
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-stone-700">
          <li>لو الخيار مش ظاهر، جرّب تحدّث الصفحة أو افتح الموقع من المتصفح الأساسي.</li>
          <li>الإشعارات هنا داخل التطبيق فقط، مفيش Push Notifications لسه.</li>
        </ul>
      </article>

      <p className="text-sm text-stone-600">لسه جديد؟ <Link href="/beta" className="underline underline-offset-4 hover:no-underline">اقرأ عن النسخة التجريبية</Link></p>

      <div className="flex flex-wrap gap-3">
        <Link href="/items" className="rounded-xl bg-clay px-5 py-3 text-white">افتح السوق</Link>
        <Link href="/dashboard" className="rounded-xl border border-stone-300 px-5 py-3">حسابي</Link>
      </div>
    </section>
  );
}
