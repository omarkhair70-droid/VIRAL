import { SectionHeading } from "@/components/section-heading";

const safetySections = [
  {
    title: "قبل ما توافق",
    points: ["اقرأ الوصف كويس.", "اسأل عن العيوب بصراحة.", "شوف الصور بوضوح قبل أي اتفاق."],
  },
  {
    title: "وقت المقابلة",
    points: ["اختار مكان عام.", "ما تبعتش فلوس مقدمًا.", "خليك معاك حد لو الصفقة كبيرة."],
  },
  {
    title: "بعد المقايضة",
    points: ["أكد الإتمام من صفحة الصفقة.", "قيّم التجربة بصدق."],
  },
  {
    title: "لو حاجة مش مريحة",
    points: ["استخدم زر بلّغ من صفحة الإعلان أو العرض أو الصفقة أو البروفايل.", "اكتب تفاصيل واضحة من غير بيانات خاصة.", "لو في خطر حقيقي، وقف التعامل فورًا واتصرف حسب الموقف."],
  },
] as const;

export default function SafetyPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <SectionHeading title="دليل الأمان في بدّلها" subtitle="نصايح بسيطة تساعدك تتفقوا بهدوء وتاخد قرار أريح." />
      <div className="grid gap-4 md:grid-cols-2">
        {safetySections.map((section) => (
          <article key={section.title} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">{section.title}</h2>
            <ul className="mt-3 space-y-2 text-sm text-gray-700">
              {section.points.map((point) => (
                <li key={point}>• {point}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
