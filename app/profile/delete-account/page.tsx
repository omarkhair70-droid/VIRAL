import { redirect } from "next/navigation";
import { submitAuthenticatedAccountDeletionRequest } from "./actions";
import { Button } from "@/components/ui/button";
import { Field, FormActions, HelperText, Label, Textarea } from "@/components/ui/form";
import { HeroPanel, InlineNotice, PageSection, PageShell, SoftPanel, SurfaceCard } from "@/components/ui/surfaces";
import { createClient } from "@/lib/supabase/server";

type PageParams = { searchParams?: Promise<{ submitted?: string; error?: string }> };

export default async function DeleteAccountPage({ searchParams }: PageParams) {
  const query = (await searchParams) ?? {};
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/profile/delete-account");

  const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).maybeSingle();

  return <PageShell><PageSection className="space-y-4">
    <HeroPanel>
      <p className="type-meta text-app-text-muted">إدارة الحساب</p>
      <h1 className="type-page-title">طلب حذف الحساب</h1>
      <p className="type-body text-app-text-secondary">لو قررت تمشي من تِسوى، يمكنك إرسال طلب حذف حسابك والبيانات المرتبطة به. الطلب يمر بمراجعة قبل التنفيذ.</p>
    </HeroPanel>
    {query.submitted ? <InlineNotice tone="accent">تم استلام طلب الحذف بنجاح، وسيتم مراجعته وفق السياسة.</InlineNotice> : null}
    {query.error ? <InlineNotice tone="danger">{query.error}</InlineNotice> : null}

    <SoftPanel className="space-y-2"><p className="text-sm"><span className="font-semibold">البريد:</span> {user.email ?? "غير متوفر"}</p>{profile?.username ? <p className="text-sm"><span className="font-semibold">اسم المستخدم:</span> {profile.username}</p> : null}</SoftPanel>

    <SurfaceCard className="space-y-4">
      <InlineNotice tone="warning">ده طلب حذف رسمي، لكنه ليس حذفًا فوريًا من أول ضغطة.</InlineNotice>
      <form action={submitAuthenticatedAccountDeletionRequest} className="space-y-4">
        <Field><Label htmlFor="request_note" optional>ملاحظات إضافية</Label><Textarea id="request_note" name="request_note" maxLength={1000} /><HelperText>اكتب أي تفاصيل تساعدنا في التحقق من الطلب وتنفيذه.</HelperText></Field>
        <FormActions><Button type="submit" variant="destructive">أرسل طلب حذف الحساب</Button></FormActions>
      </form>
    </SurfaceCard>
  </PageSection></PageShell>;
}
