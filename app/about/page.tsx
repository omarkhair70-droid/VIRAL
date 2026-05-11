import { SectionHeading } from "@/components/section-heading";

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      <SectionHeading title="لسنا سوق مستعمل. ولسنا جمعية خيرية." subtitle="إحنا بس بنؤمن إن في حاجات كتير لسه ليها صاحب تاني." />
      <article className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm leading-8 text-gray-700">
        <p>المقايضة مش سؤال “بكام؟” — هي سؤال “تنفع مين؟”.</p>
        <p>في حاجات قيمتها الحقيقية بتبان لما تروح للشخص الصح، مش لما يتحطلها رقم.</p>
        <p>الصفقات الغريبة جزء من السحر: ساعات عرض مالوش منطق على الورق… بس مثالي في الواقع.</p>
        <p>وعشان كده الفيد public: العروض نفسها بتحكي إزاي الناس شايفة القيمة، وبتفتح أبواب لصفقات تانية.</p>
      </article>
    </section>
  );
}
