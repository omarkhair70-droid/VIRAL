import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeading } from "@/components/ui/page-heading";

export const metadata: Metadata = {
  title: "بدّلها | سوق المقايضة",
  description:
    "بدّل الحاجة بدل ما تسيبها مركونة. اعرض حاجة، استقبل عروض، اتفقوا بهدوء، وبعد المقايضة قيّموا بعض.",
};

const steps = ["اعرض الحاجة", "استقبل عروض", "اتفقوا بهدوء", "قيّموا بعض بعد المقايضة"];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-10 md:py-14">
      <Card className="rounded-3xl bg-cream p-6 md:p-10">
        <PageHeading eyebrow="بدّلها — Baddelha Swap" title="بدّل الحاجة بدل ما تسيبها مركونة." subtitle="بدّلها مش سوق بيع تقليدي. دي مساحة للمقايضة الواضحة بين ناس حقيقية." />
        <div className="mt-2 flex flex-wrap gap-3">
          <ButtonLink href="/items/new" size="lg">
            اعرض حاجة
          </ButtonLink>
          <ButtonLink href="/items" variant="secondary" size="lg">
            شوف السوق
          </ButtonLink>
          <ButtonLink href="/how-it-works" variant="quiet" size="lg">
            إزاي بتشتغل؟
          </ButtonLink>
          <ButtonLink href="/install" variant="quiet" size="lg">
            نزّله كتطبيق
          </ButtonLink>
          <ButtonLink href="/beta" variant="quiet" size="lg">
            جرّب النسخة التجريبية
          </ButtonLink>
        </div>
      </Card>

      <Card className="rounded-3xl p-6 md:p-8">
        <CardHeader><CardTitle>الموضوع بيمشي في 4 خطوات</CardTitle></CardHeader>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step} className="rounded-xl border border-warmBorder bg-sand p-4 text-sm font-medium text-ink">
              <span className="mb-2 block text-xs text-muted">خطوة {index + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </Card>

      <Card className="grid gap-4 rounded-3xl p-6 md:grid-cols-3 md:p-8"><CardContent className="contents">
        <p className="rounded-xl bg-sand p-4 text-sm text-muted">مفيش بيع إجباري.</p>
        <p className="rounded-xl bg-sand p-4 text-sm text-muted">مفيش أرقام موبايل عامة.</p>
        <p className="rounded-xl bg-sand p-4 text-sm text-muted">التقييمات بتظهر بعد المقايضة المكتملة فقط.</p>
      </CardContent></Card>
    </div>
  );
}
