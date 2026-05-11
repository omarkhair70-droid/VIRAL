import { SectionHeading } from "@/components/section-heading";

export default function HowItWorksPage() {
  return (
    <section className="mx-auto max-w-4xl space-y-8 px-4 py-10">
      <SectionHeading title="إزاي بتشتغل؟" subtitle="خطوات المقايضة في بدّلها زي ما هي موجودة دلوقتي في المنتج." />
      <div className="space-y-4 rounded-3xl border border-stone-200 bg-white p-7 text-gray-700 shadow-sm">
        <p><strong>1. اعرض حاجة بصور:</strong> خليك واضح في الوصف، وصوّر الحاجة من أكتر من زاوية.</p>
        <p><strong>2. الناس تبعتلك عروض:</strong> كل واحد يقترح حاجة من عنده بدل الحاجة اللي عارضها.</p>
        <p><strong>3. ترد على العرض:</strong> قبول / تفكير / ما ظبطتش / افتح باب تاني.</p>
        <p><strong>4. لو العرض اتقبل:</strong> تتفتح صفحة تنسيق للصفقة.</p>
        <p><strong>5. الطرفين يأكدوا الإتمام:</strong> كل طرف يأكد بعد الاستلام والمعاينة.</p>
        <p><strong>6. كل طرف يقيّم التاني:</strong> قيّموا بعض بعد المقايضة عشان الثقة تبان في البروفايل.</p>
      </div>
      <p className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700">ميزات زي البلاغات المتقدمة والإشعارات الكاملة: <strong>جاي لاحقًا</strong>.</p>
    </section>
  );
}
