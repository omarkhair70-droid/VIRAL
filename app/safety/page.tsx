import { SectionHeading } from "@/components/section-heading";

const blocks = [
  ["قبل ما تبعت عرض", ["شوف وصف الحاجة كويس.", "اطلب صور واضحة لو محتاج.", "ابعت عرض محترم ومباشر."]],
  ["قبل ما تقبل عرض", ["اتأكد إن الحالة مكتوبة بصراحة.", "اسأل عن أي تفاصيل ناقصة.", "ما تستعجلش قرارك."]],
  ["وقت الاتفاق", ["اختاروا مكان عام ومناسب للطرفين.", "خد وقتك في معاينة الحاجة.", "خلي المعلومات الحساسة لآخر خطوة."]],
  ["لو العرض مش مناسب", ["الرفض اللطيف طبيعي جدًا.", "العرض ما ظبطش مش معناها إن الحاجة مالهاش قيمة."]],
  ["لو حصلت مشكلة", ["وثّق اللي حصل.", "استخدم أدوات البلاغ لما تبقى متاحة.", "سلامتك أهم من أي صفقة."]]
] as const;

export default function SafetyPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <SectionHeading title="مفتوحة… بس مش سايبة." subtitle="المقايضة ممتعة، ومع شوية قواعد بسيطة تبقى أأمن وأسهل لكل الناس." />
      <div className="grid gap-4 md:grid-cols-2">
        {blocks.map(([title, points]) => (
          <article key={title} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">{title}</h2>
            <ul className="mt-3 space-y-2 text-sm text-gray-700">{points.map((point) => <li key={point}>• {point}</li>)}</ul>
          </article>
        ))}
      </div>
    </section>
  );
}
