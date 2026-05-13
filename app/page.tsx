import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { PageHeading } from "@/components/ui/page-heading";
import { PwaInstallCard } from "@/components/pwa-install-card";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "تِسوى | سوق المقايضة",
  description:
    "تِسوى — حاجتك لسه لها قيمة. اعرض حاجة، استقبل عروض، واتفقوا بأمان في مكان عام.",
};


export default async function HomePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  let displayName = "";
  let profileQuickLinkLabel = "شوف بروفايلك";
  let priorityTitle = "جاهز تبدّل حاجة النهارده؟";
  let prioritySubtitle = "اعرض حاجة جديدة أو استكشف السوق وشوف الفرص المناسبة.";
  let priorityCtaPrimary: { href: "/items" | "/items/new" | "/dashboard/offers/received" | "/deals" | "/profile"; label: string } = { href: "/items/new", label: "اعرض حاجة" };
  let priorityCtaSecondary: { href: "/items" | "/items/new" | "/dashboard/offers/received" | "/deals" | "/profile"; label: string } | null = { href: "/items", label: "شوف السوق" };
  let showPriorityBadge = false;
  let showOnboardingChecklist = false;
  let isProfileComplete = false;
  let hasActiveItems = false;

  const { count: featuredCount } = await supabase.from("featured_story_items").select("item_id", { count: "exact", head: true });
  const { count: publishedDropsCount } = await supabase.from("creator_drops").select("id", { count: "exact", head: true }).eq("status", "published");
  const showStoryEntry = (featuredCount ?? 0) > 0 || (publishedDropsCount ?? 0) > 0;
  if (user) {
    const [{ data: profile }, { count: offersNeedAttentionCount }, { count: pendingDealsCount }, { count: activeItemsCount }] = await Promise.all([
      supabase.from("profiles").select("display_name,username,bio,city,area").eq("id", user.id).maybeSingle(),
      supabase.from("offers").select("id", { count: "exact", head: true }).eq("receiver_id", user.id).in("status", ["pending", "thinking"]),
      supabase.from("swap_deals").select("id", { count: "exact", head: true }).or(`requester_id.eq.${user.id},offerer_id.eq.${user.id}`).eq("status", "completed_pending_confirmation"),
      supabase.from("items").select("id", { count: "exact", head: true }).eq("owner_id", user.id).eq("status", "active"),
    ]);

    displayName = profile?.display_name?.trim() ?? "";
    const profileComplete = Boolean(profile?.username && profile?.bio && profile?.city && profile?.area);
    isProfileComplete = profileComplete;
    hasActiveItems = (activeItemsCount ?? 0) > 0;
    profileQuickLinkLabel = profileComplete ? "شوف بروفايلك" : "أكمل بروفايلك";

    if ((offersNeedAttentionCount ?? 0) > 0) {
      priorityTitle = (offersNeedAttentionCount ?? 0) === 1 ? "عندك عرض محتاج رد." : `عندك ${offersNeedAttentionCount} عروض محتاجة رد.`;
      prioritySubtitle = "الرد السريع بيخلّي فرصة المقايضة ما تبردش.";
      priorityCtaPrimary = { href: "/dashboard/offers/received" as const, label: "افتح العروض" };
      priorityCtaSecondary = null;
      showPriorityBadge = true;
    } else if ((pendingDealsCount ?? 0) > 0) {
      priorityTitle = (pendingDealsCount ?? 0) === 1 ? "فيه صفقة مستنية تأكيد الإتمام." : `فيه ${pendingDealsCount} صفقات مستنية تأكيد الإتمام.`;
      prioritySubtitle = "راجع غرفة الصفقة وأكّد فقط بعد التبادل الحقيقي.";
      priorityCtaPrimary = { href: "/deals" as const, label: "افتح الصفقات" };
      priorityCtaSecondary = null;
      showPriorityBadge = true;
    } else if (!profileComplete) {
      priorityTitle = "كمّل بروفايلك علشان الناس تثق فيك أسرع.";
      prioritySubtitle = "الاسم والمكان والوصف بيساعدوا العروض المناسبة توصلك.";
      priorityCtaPrimary = { href: "/profile" as const, label: "أكمل بروفايلك" };
      priorityCtaSecondary = null;
      showPriorityBadge = true;
    } else if ((activeItemsCount ?? 0) === 0) {
      priorityTitle = "لسه ما عرضتش حاجة نشطة.";
      prioritySubtitle = "ابدأ بحاجة واحدة واضحة، وسيب تِسوى يفتح لك أبواب مقايضة.";
      priorityCtaPrimary = { href: "/items/new" as const, label: "اعرض أول حاجة" };
      priorityCtaSecondary = null;
      showPriorityBadge = true;
    }

    const hasTransactionPriority = (offersNeedAttentionCount ?? 0) > 0 || (pendingDealsCount ?? 0) > 0;
    showOnboardingChecklist = !hasTransactionPriority && (!isProfileComplete || !hasActiveItems);
  }

  if (user) {
    return (
      <div className="mx-auto max-w-6xl space-y-5 px-4 py-6 md:space-y-7 md:py-10">
        <PwaInstallCard />
        <Card className="rounded-3xl bg-cream p-5 md:p-8">
          <p className="text-sm text-muted">{displayName ? `أهلاً ${displayName}` : "أهلاً بيك في تِسوى"}</p>
          {showPriorityBadge ? <div className="mt-2"><StatusPill tone="warning">الأولوية دلوقتي</StatusPill></div> : null}
          <h1 className="mt-1 text-2xl font-bold text-ink md:text-3xl">{priorityTitle}</h1>
          <p className="mt-2 text-sm text-muted">{prioritySubtitle}</p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <ButtonLink href={priorityCtaPrimary.href} size="lg">{priorityCtaPrimary.label}</ButtonLink>
            {priorityCtaSecondary ? <ButtonLink href={priorityCtaSecondary.href} variant="secondary" size="lg">{priorityCtaSecondary.label}</ButtonLink> : null}
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

        {showOnboardingChecklist ? (
          <Card className="rounded-3xl p-5 md:p-6">
            <CardHeader className="p-0"><CardTitle>ابدأ رحلتك في تِسوى</CardTitle></CardHeader>
            <CardContent className="p-0 pt-3">
              <ul className="space-y-2 text-sm text-muted">
                <li className="flex items-center justify-between gap-3 rounded-xl border border-warmBorder bg-sand p-3">
                  <span>{isProfileComplete ? "✅ أكمل بروفايلك" : "◻️ أكمل بروفايلك"}</span>
                  <Link href="/profile" className="text-xs font-medium text-ink underline underline-offset-2">افتح</Link>
                </li>
                <li className="flex items-center justify-between gap-3 rounded-xl border border-warmBorder bg-sand p-3">
                  <span>{hasActiveItems ? "✅ اعرض أول حاجة" : "◻️ اعرض أول حاجة"}</span>
                  <Link href="/items/new" className="text-xs font-medium text-ink underline underline-offset-2">ابدأ</Link>
                </li>
                <li className="rounded-xl border border-warmBorder bg-sand p-3">
                  <span>🔜 تابع العروض والرسائل</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        ) : null}
        {showStoryEntry ? <Card className="rounded-3xl p-5"><h2 className="text-xl font-semibold">حاجات ليها حكاية</h2><p className="text-sm text-muted">اختيارات ودروب متجمعة يدويًا من أقوى القصص.</p><div className="mt-3"><ButtonLink href="/drops" variant="secondary">افتح الدروب</ButtonLink></div></Card> : null}
        <Card className="rounded-3xl p-5 md:p-6">
          <CardHeader className="p-0"><CardTitle>ناس على تِسوى</CardTitle></CardHeader>
          <CardContent className="space-y-3 p-0 pt-3">
            <p className="text-sm text-muted">اتعرف على بروفايلات ناس بتبدّل بجد، إشارات ثقتهم، والحاجات النشطة اللي بيعرضوها.</p>
            <ButtonLink href="/people" variant="secondary">استكشف الناس</ButtonLink>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: peoplePreview } = await supabase
    .from("profiles")
    .select("username,display_name,city,area")
    .not("username", "is", null)
    .order("successful_swaps_count", { ascending: false })
    .limit(3);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 md:space-y-8 md:py-14">
      <PwaInstallCard />
      <Card className="rounded-3xl bg-cream p-6 md:p-10">
        <PageHeading eyebrow="تِسوى — Teswa" title="حاجتك لسه لها قيمة." subtitle="سجّل، اعرض حاجة عندك، وابدأ تستقبل عروض مقايضة من ناس حقيقية." />
        <div className="mt-3 flex flex-wrap gap-3">
          <ButtonLink href="/login?next=/items/new" size="lg">
            ابدأ وسجّل
          </ButtonLink>
          <ButtonLink href="/items" variant="secondary" size="lg">
            شوف السوق
          </ButtonLink>
          <Link href="/how-it-works" className="self-center text-sm text-muted underline underline-offset-2">
            اعرف تِسوى بتشتغل إزاي
          </Link>
        </div>
      </Card>

      <section className="grid gap-3 sm:grid-cols-3">
        <Card className="rounded-2xl p-4"><p className="text-sm font-semibold text-ink">اعرض</p><p className="mt-1 text-sm text-muted">انشر حاجة بصور ووصف واضح.</p></Card>
        <Card className="rounded-2xl p-4"><p className="text-sm font-semibold text-ink">استقبل عروض</p><p className="mt-1 text-sm text-muted">ناس تقترح عليك حاجات مناسبة.</p></Card>
        <Card className="rounded-2xl p-4"><p className="text-sm font-semibold text-ink">اتفق بأمان</p><p className="mt-1 text-sm text-muted">كمّلوا الصفقة من داخل تِسوى.</p></Card>
      </section>

      <Card className="rounded-3xl p-6 md:p-8">
        <CardHeader><CardTitle>إزاي البداية بتحصل؟</CardTitle></CardHeader>
        <ol className="mt-4 grid gap-3 sm:grid-cols-3">
          {["سجّل", "اعرض", "بدّل"].map((step, index) => (
            <li key={step} className="rounded-xl border border-warmBorder bg-sand p-4 text-sm font-medium text-ink">
              <span className="mb-2 block text-xs text-muted">خطوة {index + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </Card>

      <Card className="rounded-3xl p-6">
        <CardContent className="grid gap-3 p-0 text-sm text-muted sm:grid-cols-3">
          <p className="rounded-xl bg-sand p-4">مفيش أرقام موبايل عامة.</p>
          <p className="rounded-xl bg-sand p-4">التقييمات بعد المقايضة المكتملة.</p>
          <p className="rounded-xl bg-sand p-4">الاتفاق في مكان عام وآمن.</p>
        </CardContent>
      </Card>
      {showStoryEntry ? <Card className="rounded-3xl p-6"><h2 className="text-xl font-semibold">حاجات ليها حكاية</h2><p className="text-sm text-muted">اختيارات قصصية ودروب منسقة بعناية.</p><div className="mt-3"><ButtonLink href="/drops" variant="secondary">استكشف الدروب</ButtonLink></div></Card> : null}
      <Card className="rounded-3xl p-6 md:p-8">
        <CardHeader className="p-0">
          <CardTitle>اتعرف على ناس على تِسوى</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-0 pt-3">
          <p className="text-sm text-muted">تِسوى فيها ناس حقيقية بتبدّل، لكل واحد أسلوبه في المقايضة وإشارات الثقة والحاجات النشطة بتاعته.</p>
          {peoplePreview?.length ? <div className="grid gap-2 sm:grid-cols-3">{peoplePreview.map((person) => <Link key={person.username} href={`/users/${person.username}`} className="rounded-xl border border-warmBorder bg-sand p-3 text-sm text-ink"><p className="font-semibold">{person.display_name || person.username}</p><p className="text-xs text-muted">@{person.username}</p><p className="mt-1 text-xs text-muted">{[person.city, person.area].filter(Boolean).join(" - ") || "الموقع غير مكتمل"}</p></Link>)}</div> : null}
          <div><ButtonLink href="/people" variant="secondary">استكشف الناس</ButtonLink></div>
        </CardContent>
      </Card>
    </div>
  );
}
