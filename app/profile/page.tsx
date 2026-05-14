import type { Route } from "next";
import { redirect } from "next/navigation";
import { updateProfile } from "./actions";
import { PageShell } from "@/components/page-shell";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, FormSection, HelperText, Label, TextInput, Textarea } from "@/components/ui/form";
import { AvatarUpload, CoverUpload } from "@/components/ui/product-primitives";
import { HeroPanel, HighlightPanel, InlineNotice, PageSection, SoftPanel, SurfaceCard } from "@/components/ui/surfaces";
import { createClient } from "@/lib/supabase/server";

type PageParams = { searchParams?: Promise<{ updated?: string; error?: string }> };

export default async function ProfilePage({ searchParams }: PageParams) {
  const query = (await searchParams) ?? {};
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/profile");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name,username,city,area,bio,avatar_url,cover_url,interests,swap_preferences,preferred_categories,profile_tagline")
    .eq("id", user.id)
    .maybeSingle();

  const username = profile?.username ?? "";
  const isIncomplete = !profile?.display_name || !username;

  return <PageShell title="ظبّط بروفايلك"><PageSection className="space-y-4">
    <HeroPanel>
      <h1 className="text-2xl font-semibold">ظبّط بروفايلك</h1>
      <p className="mt-2 text-sm text-app-text-secondary">البروفايل الواضح بيخلّي الناس تفهمك وتتعامل معاك بثقة.</p>
    </HeroPanel>

    {query.updated ? <InlineNotice tone="accent">تم تحديث بروفايلك بنجاح.</InlineNotice> : null}
    {query.error ? <InlineNotice tone="danger">{query.error}</InlineNotice> : null}
    {isIncomplete ? <HighlightPanel><p className="text-sm">كمّل الاسم واسم المستخدم عشان بروفايلك العام يبقى واضح وسهل الثقة فيه.</p></HighlightPanel> : null}

    <SurfaceCard>
      <form action={updateProfile} className="space-y-6" encType="multipart/form-data">
        <FormSection>
          <h2 className="text-lg font-semibold">الهوية البصرية</h2>
          <InlineNotice tone="warning">صور البروفايل بتظهر للناس. ما ترفعش صور فيها بيانات خاصة.</InlineNotice>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field><Label>الأفاتار</Label><AvatarUpload name="avatar_file" previewUrl={profile?.avatar_url ?? null} helperText="JPG/PNG/WEBP" /></Field>
            <Field><Label>صورة الغلاف</Label><CoverUpload name="cover_file" previewUrl={profile?.cover_url ?? null} helperText="صورة عرضية واضحة للبروفايل." /></Field>
          </div>
        </FormSection>

        <FormSection>
          <h2 className="text-lg font-semibold">الأساسيات</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field><Label htmlFor="display_name" required>الاسم المعروض</Label><TextInput id="display_name" name="display_name" required minLength={2} maxLength={60} defaultValue={profile?.display_name ?? ""} /></Field>
            <Field><Label htmlFor="username" required>اسم المستخدم</Label><TextInput id="username" name="username" required minLength={3} maxLength={30} defaultValue={username} /></Field>
          </div>
          <Field><Label htmlFor="profile_tagline" optional>جملة صغيرة تحت اسمك</Label><TextInput id="profile_tagline" name="profile_tagline" maxLength={120} defaultValue={profile?.profile_tagline ?? ""} /><HelperText>مثال: بحب الحاجات اللي ليها قصة.</HelperText></Field>
        </FormSection>

        <FormSection>
          <h2 className="text-lg font-semibold">المكان والنبذة</h2>
          <div className="grid gap-3 sm:grid-cols-2"><Field><Label htmlFor="city" optional>المدينة</Label><TextInput id="city" name="city" maxLength={60} defaultValue={profile?.city ?? ""} /></Field><Field><Label htmlFor="area" optional>المنطقة</Label><TextInput id="area" name="area" maxLength={60} defaultValue={profile?.area ?? ""} /></Field></div>
          <Field><Label htmlFor="bio" optional>نبذة قصيرة</Label><Textarea id="bio" name="bio" maxLength={200} defaultValue={profile?.bio ?? ""} /></Field>
        </FormSection>

        <FormSection>
          <h2 className="text-lg font-semibold">شخصية المقايضة</h2>
          <p className="text-sm text-app-text-secondary">الكلام ده يساعد الناس تفهم أسلوبك قبل ما تبعت لك اقتراح.</p>
          <Field><Label htmlFor="interests" optional>اهتماماتك</Label><TextInput id="interests" name="interests" maxLength={180} defaultValue={profile?.interests ?? ""} /><HelperText>مثال: كتب، كاميرات، ديكور، لبس.</HelperText></Field>
          <Field><Label htmlFor="preferred_categories" optional>الفئات المفضلة</Label><TextInput id="preferred_categories" name="preferred_categories" maxLength={180} defaultValue={profile?.preferred_categories ?? ""} /></Field>
          <Field><Label htmlFor="swap_preferences" optional>إيه اللي يشدّك غالبًا في الاقتراحات؟</Label><Textarea id="swap_preferences" name="swap_preferences" maxLength={240} defaultValue={profile?.swap_preferences ?? ""} /><HelperText>اكتبها بطريقتك، دي بتساعد الناس تعرف إيه المناسب لك.</HelperText></Field>
        </FormSection>
        <Button type="submit">احفظ البروفايل</Button>
      </form>
    </SurfaceCard>

    {username ? <ButtonLink href={`/users/${username}` as Route} variant="outline">شوف شكل بروفايلك للناس</ButtonLink> : null}

    <SoftPanel className="space-y-3">
      <h2 className="text-lg font-semibold">إدارة الحساب</h2>
      <p className="text-sm text-app-text-secondary">لو لم تعد ترغب في استخدام تِسوى، يمكنك إرسال طلب حذف الحساب والبيانات المرتبطة.</p>
      <ButtonLink href="/profile/delete-account" variant="outline">طلب حذف الحساب</ButtonLink>
    </SoftPanel>

  </PageSection></PageShell>;
}
