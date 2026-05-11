import { SectionHeading } from "@/components/section-heading";

export default function HowItWorksPage() {
  return (
    <section className="mx-auto max-w-4xl space-y-8 px-4 py-10">
      <SectionHeading title="إزاي المقايضة بتمشي؟" subtitle="الموضوع بسيط، بس كل خطوة بتخلي الصفقة أوضح وأريح للطرفين." />
      <div className="space-y-4 rounded-3xl border border-stone-200 bg-white p-7 shadow-sm text-gray-700">
        <p><strong>1. نزّل حاجة واحدة:</strong> كل حاجة تاخد فرصتها لوحدها. السفرة إعلان، والدولاب إعلان، والأباجورة إعلان.</p>
        <p><strong>2. استقبل عروض:</strong> الناس تعرض عليك حاجات من عندها، والمنطقي والغريب لهم نفس الفرصة.</p>
        <p><strong>3. اختار ردك:</strong> ممكن توافق، ترفض بلطف، أو تفتح باب تاني لعرض مختلف.</p>
        <p><strong>4. اتفقوا بأمان:</strong> في MVP مافيش شات قبل القبول. بعد القبول، التفاصيل الخاصة تبقى بينكم.</p>
        <p><strong>5. الصفقة تتحول لحكاية:</strong> العروض العامة جزء من حياة المنتج، لأنها بتبين القيمة اللي الناس شايفاها في الحاجات.</p>
      </div>
    </section>
  );
}
