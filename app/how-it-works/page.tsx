import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";

export default function HowItWorksPage() {
  return (
    <section className="mx-auto max-w-4xl space-y-8 px-4 py-10">
      <SectionHeading title="إزاي بتشتغل؟" subtitle="رحلة تِسوى من لحظة ما تفتح بابًا للحاجة، لحد ما تتحول إلى مقايضة حقيقية." />
      <div className="space-y-4 rounded-3xl border border-stone-200 bg-white p-7 text-gray-700 shadow-sm">
        <p><strong>1. افتح للحاجة بابًا واضحًا:</strong> خليك واضح في الوصف، وصوّر الحاجة من أكتر من زاوية.</p>
        <p><strong>2. الناس تبعت اقتراحات:</strong> كل واحد يقترح حاجة من عنده بدل الحاجة اللي انت فاتح لها باب.</p>
        <p><strong>3. ترد على الاقتراح:</strong> قبول / تفكير / ما ظبطتش / افتح باب تاني.</p>
        <p><strong>4. لو الاقتراح اتقبل:</strong> تتفتح صفحة تنسيق للصفقة.</p>
        <p><strong>5. الطرفين يأكدوا الإتمام:</strong> كل طرف يأكد بعد الاستلام والمعاينة.</p>
        <p><strong>6. كل طرف يقيّم التاني:</strong> قيّموا بعض بعد المقايضة عشان الثقة تبان في البروفايل.</p>
      </div>
      <p className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700">ميزات زي البلاغات المتقدمة والإشعارات الكاملة: <strong>جاي لاحقًا</strong>.</p>
      <p className="text-sm text-stone-600">لو أول مرة تستخدم تِسوى، <Link href="/beta" className="underline underline-offset-4 hover:no-underline">ابدأ من صفحة النسخة التجريبية</Link>.</p>
    </section>
  );
}
