import Link from "next/link";

export function CtaBand() {
  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">يمكن الحاجة اللي عندك مستنية صاحبها التاني.</h2>
      <p className="mt-3 text-gray-600">مش لازم تبيعها. جرّب تشوف مين ممكن يفرح بيها.</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link href="/discover" className="rounded-xl bg-clay px-5 py-3 text-white">شوف حاجتك ممكن تجيبلك إيه</Link>
        <Link href="/feed" className="rounded-xl border border-stone-300 px-5 py-3 text-gray-800">اتفرّج على الصفقات الغريبة</Link>
      </div>
    </section>
  );
}
