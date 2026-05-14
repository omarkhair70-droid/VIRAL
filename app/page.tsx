import type { Metadata } from "next";
import Link from "next/link";
import { PwaInstallCard } from "@/components/pwa-install-card";
import { ButtonLink } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { HeroPanel, HighlightPanel, InlineNotice, PageSection, PageShell, SoftPanel, SurfaceCard } from "@/components/ui/surfaces";
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
      <PageShell className="max-w-6xl py-6 md:py-10">
        <PageSection className="space-y-5 md:space-y-6">
          <PwaInstallCard />

          <HeroPanel className="space-y-4 bg-[#f9efe2]">
            <p className="type-support">{displayName ? `أهلاً ${displayName}` : "أهلاً بيك في تِسوى"}</p>
            {showPriorityBadge ? <StatusPill tone="warning">الأولوية دلوقتي</StatusPill> : null}
            <h1 className="type-page-title">{priorityTitle}</h1>
            <p className="type-support">{prioritySubtitle}</p>
            <div className="flex flex-wrap gap-2.5">
              <ButtonLink href={priorityCtaPrimary.href} size="lg">{priorityCtaPrimary.label}</ButtonLink>
              {priorityCtaSecondary ? <ButtonLink href={priorityCtaSecondary.href} variant="secondary" size="lg">{priorityCtaSecondary.label}</ButtonLink> : null}
            </div>
          </HeroPanel>

          <section className="grid gap-3 sm:grid-cols-3">
            <SurfaceCard className="p-0"><Link className="block p-4" href="/dashboard"><p className="type-card-title">حسابي وعروضي</p><p className="type-meta mt-1">تابع عروضك وحاجاتك وإشعاراتك المهمة.</p></Link></SurfaceCard>
            <SurfaceCard className="p-0"><Link className="block p-4" href="/messages"><p className="type-card-title">مركز الرسائل</p><p className="type-meta mt-1">افتح المحادثات اللي فيها تنسيق فعلي دلوقتي.</p></Link></SurfaceCard>
            <SurfaceCard className="p-0"><Link className="block p-4" href="/profile"><p className="type-card-title">{profileQuickLinkLabel}</p><p className="type-meta mt-1">عدّل صورتك ومعلومات الثقة قبل أي مقايضة جديدة.</p></Link></SurfaceCard>
          </section>

          {showOnboardingChecklist ? (
            <HighlightPanel className="space-y-4">
              <div>
                <p className="type-meta">جاهز تنشّط حسابك؟</p>
                <h2 className="type-card-title mt-1">خطوتين واضحين ويبدأ التبديل فعليًا</h2>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center justify-between gap-3 rounded-surface-compact border border-app-border bg-app-surface p-3">
                  <span className="font-medium text-app-text-primary">{isProfileComplete ? "✅ أكملت بروفايلك" : "◻️ أكمل بروفايلك"}</span>
                  <ButtonLink href="/profile" variant="quiet" size="compact">افتح</ButtonLink>
                </li>
                <li className="flex items-center justify-between gap-3 rounded-surface-compact border border-app-border bg-app-surface p-3">
                  <span className="font-medium text-app-text-primary">{hasActiveItems ? "✅ عرضت أول حاجة" : "◻️ اعرض أول حاجة"}</span>
                  <ButtonLink href="/items/new" variant="quiet" size="compact">ابدأ</ButtonLink>
                </li>
                <li className="rounded-surface-compact border border-app-border bg-app-surface p-3 text-app-text-secondary">
                  💬 بعد قبول أول عرض، رسائل التنسيق هتظهر لك مباشرة في مركز الرسائل.
                </li>
              </ul>
            </HighlightPanel>
          ) : (
            <SoftPanel>
              <h2 className="type-card-title">ابدأ من هنا</h2>
              <ul className="mt-3 space-y-2 text-sm text-app-text-secondary">
                <li>1) اعرض حاجة بصور واضحة ووصف صريح.</li>
                <li>2) تابع العروض والرسائل أول بأول.</li>
                <li>3) نسّق من غرفة الصفقة وأكّد بعد التبادل الحقيقي في مكان عام وآمن.</li>
              </ul>
            </SoftPanel>
          )}

          {showStoryEntry ? <SoftPanel><h2 className="type-card-title">حاجات ليها حكاية</h2><p className="type-support mt-1">اختيارات ودروب متجمعة يدويًا من أقوى القصص.</p><div className="mt-3"><ButtonLink href="/drops" variant="secondary">افتح الدروب</ButtonLink></div></SoftPanel> : null}

          <SurfaceCard className="space-y-3">
            <div>
              <h2 className="type-card-title">ناس على تِسوى</h2>
              <p className="type-support mt-1">اتعرف على ناس بتبدّل بجد، وإشارات ثقتهم، والحاجات النشطة اللي بيعرضوها.</p>
            </div>
            <ButtonLink href="/people" variant="secondary">استكشف الناس</ButtonLink>
          </SurfaceCard>
        </PageSection>
      </PageShell>
    );
  }

  const { data: peoplePreview } = await supabase
    .from("profiles")
    .select("username,display_name,city,area")
    .not("username", "is", null)
    .order("successful_swaps_count", { ascending: false })
    .limit(3);

  return (
    <PageShell className="max-w-6xl py-10 md:py-14">
      <PageSection className="space-y-6 md:space-y-8">
        <PwaInstallCard />

        <HeroPanel className="space-y-4 bg-[#f9efe2] p-panel-lg ">
          <p className="type-meta">تِسوى — Teswa</p>
          <h1 className="type-hero">حاجتك لسه لها قيمة.</h1>
          <p className="type-body text-app-text-secondary">سجّل، اعرض حاجة عندك، استقبل عروض من ناس حقيقية، ونسّق المقايضة من داخل تِسوى.</p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/login?next=/items/new" size="lg">ابدأ وسجّل</ButtonLink>
            <ButtonLink href="/items" variant="secondary" size="lg">شوف السوق</ButtonLink>
            <Link href="/how-it-works" className="self-center text-sm text-app-text-muted underline underline-offset-2">اعرف تِسوى بتشتغل إزاي</Link>
          </div>
        </HeroPanel>

        <SurfaceCard className="space-y-4">
          <div>
            <p className="type-meta">آلية المقايضة</p>
            <h2 className="type-section-title mt-1">ثلاث حركات بسيطة تخليك تبدأ بثقة</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {["اعرض حاجة بصور ووصف واضح.", "استقبل عروض مناسبة من ناس حقيقية.", "نسّق بأمان من الرسائل وغرفة الصفقة."].map((step, index) => (
              <SoftPanel key={step} className="space-y-1">
                <p className="type-meta">0{index + 1}</p>
                <p className="type-card-title">{index === 0 ? "اعرض" : index === 1 ? "استقبل عروض" : "نسّق بأمان"}</p>
                <p className="type-support">{step}</p>
              </SoftPanel>
            ))}
          </div>
        </SurfaceCard>

        <HighlightPanel className="space-y-4">
          <div>
            <p className="type-meta">إزاي البداية بتحصل؟</p>
            <h2 className="type-card-title mt-1">سجّل، اعرض، وابدأ أول مقايضة</h2>
          </div>
          <ol className="grid gap-2 sm:grid-cols-3">
            {["سجّل", "اعرض", "بدّل"].map((step, index) => (
              <li key={step} className="rounded-surface-compact border border-app-border bg-app-surface p-3 text-sm font-medium text-app-text-primary">
                <span className="type-meta mb-1 block">خطوة {index + 1}</span>
                {step}
              </li>
            ))}
          </ol>
          <InlineNotice tone="accent">ابدأ بحاجة واحدة كويسة، والباقي بييجي بسهولة مع أول عرض جاد.</InlineNotice>
        </HighlightPanel>

        <SurfaceCard className="space-y-3">
          <h2 className="type-card-title">الثقة والأمان في المقايضة</h2>
          <div className="grid gap-2 text-sm text-app-text-secondary sm:grid-cols-3">
            <SoftPanel>مفيش أرقام موبايل عامة.</SoftPanel>
            <SoftPanel>التقييمات بعد المقايضة المكتملة.</SoftPanel>
            <SoftPanel>الاتفاق في مكان عام وآمن.</SoftPanel>
          </div>
        </SurfaceCard>

        {showStoryEntry ? <SoftPanel><h2 className="type-card-title">حاجات ليها حكاية</h2><p className="type-support mt-1">اختيارات قصصية ودروب منسقة بعناية.</p><div className="mt-3"><ButtonLink href="/drops" variant="secondary">استكشف الدروب</ButtonLink></div></SoftPanel> : null}

        <SurfaceCard className="space-y-4">
          <div>
            <h2 className="type-card-title">اتعرف على ناس على تِسوى</h2>
            <p className="type-support mt-1">ناس حقيقية بتبدّل بجد. شوف أماكنهم وإشارات الثقة وبدايات نشاطهم.</p>
          </div>
          {peoplePreview?.length ? (
            <div className="grid gap-2 sm:grid-cols-3">
              {peoplePreview.map((person) => (
                <Link key={person.username} href={`/users/${person.username}`} className="rounded-surface-compact border border-app-border bg-app-soft p-3 text-sm text-app-text-primary">
                  <p className="font-semibold">{person.display_name || person.username}</p>
                  <p className="text-xs text-app-text-muted">@{person.username}</p>
                  <p className="mt-1 text-xs text-app-text-muted">{[person.city, person.area].filter(Boolean).join(" - ") || "الموقع غير مكتمل"}</p>
                </Link>
              ))}
            </div>
          ) : null}
          <div><ButtonLink href="/people" variant="secondary">استكشف الناس</ButtonLink></div>
        </SurfaceCard>
      </PageSection>
    </PageShell>
  );
}
