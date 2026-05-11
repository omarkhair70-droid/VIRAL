import Link from "next/link";

export default function OfflinePage() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-12 text-center">
      <h1 className="text-3xl font-bold text-gray-900">أنت أوفلاين دلوقتي</h1>
      <p className="mt-3 text-base text-stone-700">الاتصال مش متاح. أول ما النت يرجع، افتح السوق أو حسابك تاني.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/items" className="rounded-xl bg-clay px-5 py-3 text-white">جرّب تفتح السوق</Link>
        <Link href="/" className="rounded-xl border border-stone-300 px-5 py-3">ارجع للرئيسية</Link>
      </div>
    </section>
  );
}
