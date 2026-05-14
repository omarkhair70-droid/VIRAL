import { submitPublicAccountDeletionRequest } from "./actions";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, FormActions, HelperText, Label, TextInput, Textarea } from "@/components/ui/form";
import { HeroPanel, InlineNotice, PageSection, PageShell, SoftPanel, SurfaceCard } from "@/components/ui/surfaces";

type PageParams = { searchParams?: Promise<{ submitted?: string; error?: string }> };

export default async function AccountDeletionPage({ searchParams }: PageParams) {
  const query = (await searchParams) ?? {};

  return <PageShell><PageSection className="space-y-4">
    <HeroPanel>
      <p className="type-meta text-app-text-muted">حذف الحساب</p>
      <h1 className="type-page-title">اطلب حذف حسابك وبياناتك</h1>
      <p className="type-body text-app-text-secondary">لو لم تعد ترغب في استخدام تِسوى، يمكنك إرسال طلب حذف الحساب والبيانات المرتبطة به للمراجعة والتنفيذ وفقًا للسياسة المعلنة.</p>
    </HeroPanel>
    {query.submitted ? <InlineNotice tone="accent">تم استلام طلبك. سنراجعه ضمن مسار حذف الحساب والبيانات المرتبطة.</InlineNotice> : null}
    {query.error ? <InlineNotice tone="danger">{query.error}</InlineNotice> : null}

    <SurfaceCard className="space-y-4">
      <InlineNotice tone="warning">إرسال الطلب لا يعني الحذف الفوري. بنراجع الطلب ونتعامل معه وفقًا لسياسة الخصوصية ومتطلبات السلامة.</InlineNotice>
      <SoftPanel className="space-y-3">
        <p className="type-body text-app-text-secondary">لو تقدر تسجل دخولك، يوجد مسار أسرع من داخل الحساب.</p>
        <ButtonLink href="/profile/delete-account" variant="outline">ابدأ من داخل الحساب</ButtonLink>
      </SoftPanel>
      <form action={submitPublicAccountDeletionRequest} className="space-y-4">
        <Field><Label htmlFor="email" required>البريد المرتبط بالحساب</Label><TextInput id="email" name="email" type="email" required maxLength={160} /></Field>
        <Field><Label htmlFor="username" optional>اسم المستخدم إن وجد</Label><TextInput id="username" name="username" maxLength={50} /></Field>
        <Field><Label htmlFor="request_note" optional>ملاحظة تساعدنا نراجع الطلب</Label><Textarea id="request_note" name="request_note" maxLength={1000} /><HelperText>مثال: لا أستطيع تسجيل الدخول، أو أريد حذف الحساب بالكامل.</HelperText></Field>
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
        <FormActions><Button type="submit">إرسال طلب الحذف</Button></FormActions>
      </form>
    </SurfaceCard>
  </PageSection></PageShell>;
}
