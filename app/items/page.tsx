import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";

export default function ItemsPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <SectionHeading title="الحاجات المعروضة" subtitle="السوق الحقيقي لسه بيتبني. ابدأ بشيء عندك، أو اتفرّج على الصفقات الغريبة." />
      <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-8 text-center">
        <p className="text-gray-600">لسه مافيش تصفح كامل للعناصر في المرحلة دي، لكن الجو العام جاهز.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link href="/discover" className="rounded-xl bg-clay px-5 py-3 text-white">شوف حاجتك ممكن تجيبلك إيه</Link>
          <Link href="/items/new" className="rounded-xl border border-stone-300 px-5 py-3">اعرض حاجة</Link>
        </div>
      </div>
    </section>
  );
}
