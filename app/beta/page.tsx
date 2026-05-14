import type { Metadata } from "next";
import { ShareActions } from "@/components/share-actions";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeading } from "@/components/ui/page-heading";

export const metadata: Metadata = {
  title: "تِسوى Beta",
  description: "بدّل الحاجة بدل ما تسيبها مركونة.",
};

export default function BetaPage() {
  return (
    <section className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      <Card className="bg-cream">
        <PageHeading title="جرّب تِسوى في النسخة التجريبية" subtitle="دي نسخة تجريبية متحكَّم فيها عشان نتأكد إن الرحلة واضحة وآمنة قبل التوسّع." />
        <p className="text-sm text-muted">ليه Beta؟ لأننا بنفتح تِسوى بالتدريج ونحسّن التجربة من ملاحظات المستخدمين الحقيقيين.</p>
        <div className="mt-4">
          <ShareActions title="تِسوى Beta" text="جرب تِسوى: بدّل الحاجة بدل ما تسيبها مركونة." urlPath="/beta" label="ابعتها لحد يجربها معاك" />
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle>أول حاجة تعملها</CardTitle></CardHeader>
        <CardContent>
        <ul className="mt-3 list-inside list-disc space-y-1 text-muted">
          <li>اعرض حاجة عندك بصور واضحة.</li>
          <li>الناس تبعت لك اقتراحات.</li>
          <li>لما تقبل اقتراح، تتفتح صفحة تنسيق.</li>
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

      <Card>
        <CardHeader><CardTitle>عايز تساعدنا؟</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-inside list-disc space-y-1 text-muted">
            <li>جرّب تنشر حاجة.</li>
            <li>ابعت اقتراحًا لو لقيت حاجة مناسبة.</li>
            <li>لو حاجة مش واضحة ابعت feedback.</li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <ButtonLink href="/feedback" variant="secondary">ابعت feedback</ButtonLink>
            <ButtonLink href="/install" variant="secondary">تثبيت التطبيق</ButtonLink>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <ButtonLink href="/items/new">ابدأ واعرض حاجة</ButtonLink>
        <ButtonLink href="/items" variant="secondary">استكشف الاحتمالات</ButtonLink>
        <ButtonLink href="/how-it-works" variant="secondary">إزاي بتشتغل؟</ButtonLink>
      </div>
    </section>
  );
}
