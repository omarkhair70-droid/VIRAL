import Link from "next/link";
import { redirect } from "next/navigation";
import { submitFeedback } from "@/app/feedback/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeading } from "@/components/ui/page-heading";
import { createClient } from "@/lib/supabase/server";

type SearchParams = { sent?: string; error?: string };

export default async function FeedbackPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/feedback");

  return <section className="mx-auto max-w-2xl space-y-4 px-4 py-10">
    <PageHeading title="ابعت رأيك" subtitle="لو حاجة مش واضحة، أو قابلت مشكلة، ابعتلنا التفاصيل. ده بيساعدنا نطوّر بدّلها في البيتا." />
    <p className="text-sm text-muted">لو أنت من أوائل مجربي البيتا، رأيك مهم حتى لو الملاحظة صغيرة.</p>
    {params.sent === "1" ? <Alert variant="success">وصلنا رأيك. شكرًا إنك بتساعدنا نحسّن التجربة. <Link className="underline" href="/dashboard/feedback">شوف feedback اللي بعته</Link></Alert> : null}
    {params.error ? <Alert variant="danger">تعذر إرسال الـ feedback دلوقتي. راجع البيانات وحاول تاني.</Alert> : null}
    <Card><CardContent>
      <form action={submitFeedback} className="space-y-3">
        <label className="block text-sm">النوع<select name="feedback_type" required className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"><option value="bug">مشكلة</option><option value="idea">اقتراح</option><option value="confusion">حاجة مش واضحة</option><option value="praise">تجربة كويسة</option><option value="other">حاجة تانية</option></select></label>
        <label className="block text-sm">العنوان<input name="subject" required maxLength={120} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" /></label>
        <p className="text-xs text-stone-600">اكتب تفاصيل قصيرة وواضحة.</p>
        <label className="block text-sm">التفاصيل<textarea name="details" maxLength={1000} rows={5} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" /></label>
        <p className="text-xs text-stone-600">لو المشكلة في صفحة معينة، انسخ الرابط أو اكتب اسم الصفحة.</p>
        <label className="block text-sm">الصفحة (اختياري)<input name="page_path" maxLength={300} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" /></label>
        <Button type="submit">ابعت feedback</Button>
      </form>
    </CardContent></Card>
  </section>;
}
