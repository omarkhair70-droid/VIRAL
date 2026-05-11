import type { Metadata } from "next";
import Link from "next/link";
import { ShareActions } from "@/components/share-actions";

export const metadata: Metadata = {
  title: "بدّلها Beta",
  description: "بدّل الحاجة بدل ما تسيبها مركونة.",
};

export default function BetaPage() {
  return (
    <section className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      <div className="rounded-2xl border border-warmBorder bg-cream p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-ink">جرّب بدّلها في النسخة التجريبية</h1>
        <p className="mt-3 text-muted">
          بدّل الحاجة بدل ما تسيبها مركونة. اعرض اللي عندك، استقبل عروض، واتفقوا بهدوء.
        </p>
        <p className="mt-2 text-sm text-muted">دي نسخة تجريبية متحكَّم فيها: التجربة شغالة، ولسه بنحسّن التفاصيل خطوة بخطوة.</p>
        <div className="mt-4">
          <ShareActions title="بدّلها Beta" text="جرب بدّلها: بدّل الحاجة بدل ما تسيبها مركونة." urlPath="/beta" label="ابعتها لحد يجربها معاك" />
        </div>
      </div>

      <article className="rounded-2xl border border-warmBorder bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-ink">بتعمل إيه؟</h2>
        <ul className="mt-3 list-inside list-disc space-y-1 text-muted">
          <li>اعرض حاجة عندك بصور واضحة.</li>
          <li>الناس تبعتلك عروض مقايضة.</li>
          <li>لما تقبل عرض، تتفتح صفحة تنسيق.</li>
          <li>بعد المقايضة، الطرفين يقيّموا بعض.</li>
        </ul>
      </article>

      <article className="rounded-2xl border border-warmBorder bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-ink">قواعد بسيطة</h2>
        <ul className="mt-3 list-inside list-disc space-y-1 text-muted">
          <li>خليك واضح في الوصف.</li>
          <li>اتقابلوا في مكان عام.</li>
          <li>ما تبعتش بيانات حساسة بدري.</li>
          <li>بلّغ لو حاجة مش مريحة.</li>
        </ul>
      </article>

      <div className="flex flex-wrap gap-3">
        <Link href="/items/new" className="rounded-xl bg-clay px-5 py-3 text-white hover:bg-clayDark">ابدأ واعرض حاجة</Link>
        <Link href="/items" className="rounded-xl border border-warmBorder bg-white px-5 py-3">شوف السوق</Link>
        <Link href="/how-it-works" className="rounded-xl border border-warmBorder bg-white px-5 py-3">إزاي بتشتغل؟</Link>
      </div>
    </section>
  );
}
