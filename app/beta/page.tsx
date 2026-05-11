import type { Metadata } from "next";
import { ShareActions } from "@/components/share-actions";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeading } from "@/components/ui/page-heading";

export const metadata: Metadata = {
  title: "بدّلها Beta",
  description: "بدّل الحاجة بدل ما تسيبها مركونة.",
};

export default function BetaPage() {
  return (
    <section className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      <Card className="bg-cream">
        <PageHeading title="جرّب بدّلها في النسخة التجريبية" subtitle="بدّل الحاجة بدل ما تسيبها مركونة. اعرض اللي عندك، استقبل عروض، واتفقوا بهدوء." />
        <p className="text-sm text-muted">دي نسخة تجريبية متحكَّم فيها: التجربة شغالة، ولسه بنحسّن التفاصيل خطوة بخطوة.</p>
        <div className="mt-4">
          <ShareActions title="بدّلها Beta" text="جرب بدّلها: بدّل الحاجة بدل ما تسيبها مركونة." urlPath="/beta" label="ابعتها لحد يجربها معاك" />
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle>بتعمل إيه؟</CardTitle></CardHeader>
        <CardContent>
        <ul className="mt-3 list-inside list-disc space-y-1 text-muted">
          <li>اعرض حاجة عندك بصور واضحة.</li>
          <li>الناس تبعتلك عروض مقايضة.</li>
          <li>لما تقبل عرض، تتفتح صفحة تنسيق.</li>
          <li>بعد المقايضة، الطرفين يقيّموا بعض.</li>
        </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>قواعد بسيطة</CardTitle></CardHeader>
        <CardContent>
        <ul className="mt-3 list-inside list-disc space-y-1 text-muted">
          <li>خليك واضح في الوصف.</li>
          <li>اتقابلوا في مكان عام.</li>
          <li>ما تبعتش بيانات حساسة بدري.</li>
          <li>بلّغ لو حاجة مش مريحة.</li>
        </ul>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <ButtonLink href="/items/new">ابدأ واعرض حاجة</ButtonLink>
        <ButtonLink href="/items" variant="secondary">شوف السوق</ButtonLink>
        <ButtonLink href="/how-it-works" variant="secondary">إزاي بتشتغل؟</ButtonLink>
      </div>
    </section>
  );
}
