import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeading } from "@/components/ui/page-heading";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "بدّلها | سوق المقايضة",
  description:
    "بدّل الحاجة بدل ما تسيبها مركونة. اعرض حاجة، استقبل عروض، اتفقوا بهدوء، وبعد المقايضة قيّموا بعض.",
};

const steps = ["اعرض حاجة مركونة", "استقبل عروض", "افتح صفحة التنسيق", "قيّم بعد المقايضة"];

export default async function HomePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  let displayName = "";
  let profileQuickLinkLabel = "شوف بروفايلك";

  const { count: featuredCount } = await supabase.from("featured_story_items").select("item_id", { count: "exact", head: true });
  const { count: publishedDropsCount } = await supabase.from("creator_drops").select("id", { count: "exact", head: true }).eq("status", "published");
  const showStoryEntry = (featuredCount ?? 0) > 0 || (publishedDropsCount ?? 0) > 0;

  if (user) {
    const { data: profile } = await supabase.from("profiles").select("display_name,username,bio,city,area").eq("id", user.id).maybeSingle();
    displayName = profile?.display_name?.trim() ?? "";
    const profileComplete = Boolean(profile?.username && profile?.bio && profile?.city && profile?.area);
    profileQuickLinkLabel = profileComplete ? "شوف بروفايلك" : "أكمل بروفايلك";
  }

  if (user) {
    return (
      <div className="mx-auto max-w-6xl space-y-5 px-4 py-6 md:space-y-7 md:py-10">
        <Card className="rounded-3xl bg-cream p-5 md:p-8">
          <p className="text-sm text-muted">{displayName ? `أهلاً ${displayName}` : "أهلاً بيك في بدّلها"}</p>
          <h1 className="mt-1 text-2xl font-bold text-ink md:text-3xl">جاهز تبدّل حاجة النهارده؟</h1>
          <p className="mt-2 text-sm text-muted">ابدأ بسرعة: انشر حاجة مركونة أو استكشف السوق وشوف العروض المناسبة ليك.</p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <ButtonLink href="/items/new" size="lg">اعرض حاجة</ButtonLink>
            <ButtonLink href="/items" variant="secondary" size="lg">شوف السوق</ButtonLink>
          </div>
        </Card>

        <section className="grid gap-3 sm:grid-cols-3">
          <Link className="rounded-2xl border border-warmBorder bg-white p-4 text-sm font-medium text-ink" href="/dashboard">حسابي وعروضي</Link>
          <Link className="rounded-2xl border border-warmBorder bg-white p-4 text-sm font-medium text-ink" href="/notifications">الإشعارات</Link>
          <Link className="rounded-2xl border border-warmBorder bg-white p-4 text-sm font-medium text-ink" href="/profile">{profileQuickLinkLabel}</Link>
        </section>

        <Card className="rounded-3xl p-5 md:p-6">
          <CardHeader className="p-0"><CardTitle>ابدأ من هنا</CardTitle></CardHeader>
          <CardContent className="p-0 pt-3">
            <ul className="space-y-2 text-sm text-muted">
              <li>1) اعرض حاجة بصور واضحة ووصف صريح.</li>
              <li>2) تابع الإشعارات أول بأول عشان مايفوتكش أي عرض.</li>
              <li>3) لما تتفقوا، كمّلوا المقايضة في مكان عام وآمن.</li>
            </ul>
          </CardContent>
        </Card>
        {showStoryEntry ? <Card className="rounded-3xl p-5"><h2 className="text-xl font-semibold">حاجات ليها حكاية</h2><p className="text-sm text-muted">اختيارات ودروب متجمعة يدويًا من أقوى القصص.</p><div className="mt-3"><ButtonLink href="/drops" variant="secondary">افتح الدروب</ButtonLink></div></Card> : null}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-10 md:py-14">
      <Card className="rounded-3xl bg-cream p-6 md:p-10">
        <PageHeading eyebrow="بدّلها — Baddelha Swap" title="بدّل الحاجة بدل ما تسيبها مركونة." subtitle="بدّلها مساحة مقايضة عملية: اعرض حاجة، استقبل عروض، واتفقوا بأمان في مكان عام." />
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
          <ButtonLink href="/beta" variant="quiet" size="lg">
            ليه النسخة Beta؟
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
      {showStoryEntry ? <Card className="rounded-3xl p-6"><h2 className="text-xl font-semibold">حاجات ليها حكاية</h2><p className="text-sm text-muted">اختيارات قصصية ودروب منسقة بعناية.</p><div className="mt-3"><ButtonLink href="/drops" variant="secondary">استكشف الدروب</ButtonLink></div></Card> : null}
    </div>
  );
}
