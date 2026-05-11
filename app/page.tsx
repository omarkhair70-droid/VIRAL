import type { Metadata } from "next";
import Link from "next/link";
import { CategoryPill } from "@/components/category-pill";
import { CtaBand } from "@/components/cta-band";
import { FeedCard } from "@/components/feed-card";
import { SectionHeading } from "@/components/section-heading";
import { SwapCard } from "@/components/swap-card";
import { completedSwapExamples, demoFeedItems } from "@/lib/demo-feed";

export const metadata: Metadata = {
  title: "VIRAL | المقايضة الاجتماعية",
  description: "يمكن الحاجة اللي مركونة عندك هي بالظبط اللي حد تاني بيدور عليها. بدّل اللي مش فارق معاك بحاجة تفرق معاك."
};

const categories = ["حاجات البيت", "لبس وإكسسوارات", "إلكترونيات خفيفة", "كتب وهوايات", "نباتات وديكور", "حاجات غريبة محدش عارف يصنّفها"];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl space-y-16 px-4 py-10 md:py-16">
      <section className="grid gap-8 rounded-3xl border border-stone-200 bg-white p-8 shadow-sm md:grid-cols-2 md:p-10">
        <div>
          <h1 className="text-3xl font-bold leading-tight text-gray-900 md:text-5xl">يمكن الحاجة اللي مركونة عندك<br />هي بالظبط اللي حد تاني بيدور عليها.</h1>
          <p className="mt-4 text-lg leading-8 text-gray-600">بدّل اللي مش فارق معاك بحاجة تفرق معاك.<br />أو ادخل اتفرّج على صفقات غريبة بتحصل حوالينا.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/discover" className="rounded-xl bg-clay px-5 py-3 text-white">شوف حاجتك ممكن تجيبلك إيه</Link>
            <Link href="/feed" className="rounded-xl border border-stone-300 px-5 py-3">اتفرّج على الصفقات الغريبة</Link>
          </div>
          <p className="mt-4 text-sm text-gray-500">سفرة ببنطلون؟ مخدة فايبر بأسياخ كفتة؟<br />مش لازم نفهمها… المهم الطرفين مبسوطين.</p>
        </div>
        <div className="relative min-h-[280px] rounded-2xl bg-stone-50 p-4">
          {[["سفرة", "مروحة"],["جاكيت جلد", "شباك قديم"],["مخدة فايبر", "أسياخ كفتة"],["نباتة كبيرة", "كرسي مكتب"]].map((pair, i) => (
            <div key={pair[0]} className={`absolute rounded-xl border border-stone-200 bg-white px-4 py-3 shadow-sm ${["top-4 right-4","top-20 left-6","bottom-20 right-10","bottom-4 left-4"][i]}`}>
              <p className="text-sm font-medium text-gray-700">{pair[0]} ↔ {pair[1]}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeading title="الناس بتعرض إيه على إيه دلوقتي؟" />
        <div className="grid gap-4 md:grid-cols-3">{demoFeedItems.slice(0, 3).map((item) => <FeedCard key={item.id} item={item} />)}</div>
        <Link href="/feed" className="mt-5 inline-flex text-clay hover:underline">افتح كل العروض</Link>
      </section>

      <section>
        <SectionHeading title="صفقات مالهاش منطق… بس نفعت." />
        <div className="grid gap-4 md:grid-cols-3">{completedSwapExamples.map((item) => <SwapCard key={item.id} swap={item.swap} note={item.note} demoLabel />)}</div>
      </section>

      <section className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
        <SectionHeading title="عندك حاجة مش عارف تعمل بيها إيه؟" subtitle="اكتب اسمها وشوف ممكن تفتحلك باب لإيه. مش هنقولك سعرها كام. هنوريك يمكن تتبدل بإيه." />
        <div className="flex flex-col gap-3 md:flex-row">
          <input readOnly aria-label="عنصر للتبديل" placeholder="اكتب حاجة عندك… سفرة، جاكيت، كاميرا، كرسي مكتب" className="w-full rounded-xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm" />
          <Link href="/discover" className="rounded-xl bg-clay px-5 py-3 text-center text-white">شوف الاحتمالات</Link>
        </div>
      </section>

      <section className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
        <SectionHeading title="مش كل حاجة ما بتتباعش تبقى مالهاش قيمة." />
        <p className="leading-8 text-gray-700">في حاجات بتقف معانا.<br />لسه نافعة، بس مش لاقية مشتري.<br />لسه حلوة، بس مش في مكانها الصح.</p>
        <p className="mt-4 text-lg font-medium">المقايضة بتديها فرصة تانية: بدل ما تسأل “بكام؟”، اسأل “تنفع مين؟”</p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm"><SectionHeading title="الموضوع أبسط مما باين." /><ol className="space-y-3 text-sm leading-7 text-gray-700"><li>1. نزّل حاجة واحدة — صورة واضحة، حالة الحاجة، وإيه اللي ممكن يخليك تقول آه.</li><li>2. استقبل عروض — الناس تعرض عليك حاجات من عندها.</li><li>3. اقبل، فكّر، أو افتح باب تاني — ممكن يفتح صفقة تانية.</li><li>4. اتفقوا بأمان — بعد القبول، التفاصيل الخاصة تبقى بينكم.</li></ol><Link href="/how-it-works" className="mt-5 inline-flex text-clay hover:underline">اعرف أكتر</Link></div>
        <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm"><SectionHeading title="مفتوحة… بس مش سايبة." /><ul className="space-y-2 text-sm text-gray-700"><li>• شوف بروفايل الشخص وعدد صفقاته.</li><li>• اطلب صور واضحة قبل الاتفاق.</li><li>• الحالة لازم تكون مكتوبة بصراحة.</li><li>• العنوان والتفاصيل الخاصة لا تظهر للناس.</li><li>• لو العرض مش مناسب، ارفض بلطف من غير إحراج.</li></ul><Link href="/safety" className="mt-5 inline-flex text-clay hover:underline">إزاي نخلي المقايضة آمنة؟</Link></div>
      </section>

      <section>
        <SectionHeading title="ابدأ من أي عالم." />
        <div className="flex flex-wrap gap-3">{categories.map((category) => <CategoryPill key={category} label={category} />)}</div>
      </section>

      <CtaBand />
    </div>
  );
}
