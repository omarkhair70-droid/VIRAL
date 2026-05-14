import type { Metadata, Route } from "next";
import Link from "next/link";
import { PwaInstallCard } from "@/components/pwa-install-card";
import { ButtonLink } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { HeroPanel, HighlightPanel, InlineNotice, PageSection, PageShell, SoftPanel, SurfaceCard } from "@/components/ui/surfaces";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "تِسوى | حاجتك ممكن تِسوى إيه عند غيرك؟",
  description:
    "تِسوى مساحة تعرض فيها الحاجات اللي خرجت من حياتك، وتشوف قيمتها وهي بتتغيّر في عيون ناس تانية من خلال عروض ومقايضات غير متوقعة.",
};

type HomeItem = {
  id: string;
  title: string | null;
  desire_mode: string | null;
  desire_text: string | null;
  city: string | null;
  area: string | null;
  item_story: string | null;
  swap_reason: string | null;
  good_for: string | null;
  item_images: { image_url: string | null }[] | null;
};

function itemHref(item: HomeItem): Route {
  return `/items/${item.id}` as Route;
}

function itemLine(item: HomeItem) {
  if (item.desire_text?.trim()) return item.desire_text.trim();
  if (item.desire_mode === "surprise") return "فاتح باب مفاجآت.. سيب اقتراحك يحكي قيمة جديدة.";
  if (item.desire_mode === "flexible") return "مرن في التبديل.. اقتراحك ممكن يفتح باب مناسب.";
  if (item.swap_reason?.trim()) return item.swap_reason.trim();
  if (item.good_for?.trim()) return item.good_for.trim();
  return "لو شدت عينك، قول إنت شايفها تِسوى إيه عندك.";
}

function PossibilityRail({ title, subtitle, items }: { title: string; subtitle: string; items: HomeItem[] }) {
  if (!items.length) return null;

  return (
    <SurfaceCard className="space-y-4">
      <div>
        <h2 className="type-section-title">{title}</h2>
        <p className="type-support mt-1">{subtitle}</p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {items.map((item) => (
          <Link key={item.id} href={itemHref(item)} className="rounded-surface-compact border border-app-border bg-app-soft p-3 transition hover:bg-app-surface">
            <div className="aspect-[4/3] overflow-hidden rounded-surface-compact bg-app-border/40">
              {item.item_images?.[0]?.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.item_images[0].image_url} alt={item.title || "عنصر من تِسوى"} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center px-3 text-center text-xs text-app-text-muted">صورة هتظهر هنا لما صاحب الحاجة يضيفها.</div>
              )}
            </div>
            <p className="mt-3 type-card-title line-clamp-1">{item.title || "حاجة بدون عنوان"}</p>
            <p className="mt-1 line-clamp-2 text-sm text-app-text-secondary">{itemLine(item)}</p>
            <p className="mt-2 text-xs text-app-text-muted">{[item.city, item.area].filter(Boolean).join(" - ") || "المكان غير مكتمل"}</p>
          </Link>
        ))}
      </div>
    </SurfaceCard>
  );
}

export default async function HomePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  let displayName = "";
  let profileQuickLinkLabel = "شوف بروفايلك";
  let priorityTitle = "في تنسيق بسيط ممكن يفرق معاك.";
  let prioritySubtitle = "تابع الحاجة اللي محتاجة انتباهك بسرعة.";
  let priorityCtaPrimary: { href: "/items" | "/items/new" | "/dashboard/offers/received" | "/deals" | "/profile"; label: string } = { href: "/items/new", label: "اعرض حاجة" };
  let showPriorityBadge = false;
  let showOnboardingChecklist = false;
  let isProfileComplete = false;
  let hasActiveItems = false;

  const [
    { count: featuredCount },
    { count: publishedDropsCount },
    { count: movingItemsCount },
    { data: surpriseItemsRaw },
    { data: storyItemsRaw },
    { data: curiosityItemsRaw },
  ] = await Promise.all([
    supabase.from("featured_story_items").select("item_id", { count: "exact", head: true }),
    supabase.from("creator_drops").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("items").select("id", { count: "exact", head: true }).eq("status", "active").gt("offer_count", 0),
    supabase
      .from("items")
      .select("id,title,desire_mode,desire_text,city,area,item_story,swap_reason,good_for,item_images(image_url)")
      .eq("status", "active")
      .in("desire_mode", ["surprise", "flexible"])
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("items")
      .select("id,title,desire_mode,desire_text,city,area,item_story,swap_reason,good_for,item_images(image_url)")
      .eq("status", "active")
      .or("item_story.not.is.null,swap_reason.not.is.null,good_for.not.is.null")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("items")
      .select("id,title,desire_mode,desire_text,city,area,item_story,swap_reason,good_for,item_images(image_url)")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const showMotionEntry = (featuredCount ?? 0) > 0 || (publishedDropsCount ?? 0) > 0 || (movingItemsCount ?? 0) > 0;
  const surpriseItems = (surpriseItemsRaw ?? []) as HomeItem[];
  const storyItems = (storyItemsRaw ?? []) as HomeItem[];
  const curiosityItems = (curiosityItemsRaw ?? []) as HomeItem[];

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
      showPriorityBadge = true;
    } else if ((pendingDealsCount ?? 0) > 0) {
      priorityTitle = (pendingDealsCount ?? 0) === 1 ? "فيه صفقة مستنية تأكيد الإتمام." : `فيه ${pendingDealsCount} صفقات مستنية تأكيد الإتمام.`;
      prioritySubtitle = "راجع غرفة الصفقة وأكّد فقط بعد التبادل الحقيقي.";
      priorityCtaPrimary = { href: "/deals" as const, label: "افتح الصفقات" };
      showPriorityBadge = true;
    } else if (!profileComplete) {
      priorityTitle = "كمّل بروفايلك علشان الناس تثق فيك أسرع.";
      prioritySubtitle = "الاسم والمكان والوصف بيساعدوا العروض المناسبة توصلك.";
      priorityCtaPrimary = { href: "/profile" as const, label: "أكمل بروفايلك" };
      showPriorityBadge = true;
    } else if ((activeItemsCount ?? 0) === 0) {
      priorityTitle = "لسه ما عرضتش حاجة نشطة.";
      prioritySubtitle = "ابدأ بحاجة واحدة واضحة، وسيب تِسوى يفتح لك أبواب احتمالات.";
      priorityCtaPrimary = { href: "/items/new" as const, label: "اعرض أول حاجة" };
      showPriorityBadge = true;
    }

    const hasTransactionPriority = (offersNeedAttentionCount ?? 0) > 0 || (pendingDealsCount ?? 0) > 0;
    showOnboardingChecklist = !hasTransactionPriority && (!isProfileComplete || !hasActiveItems);
  }

  const heroPrimaryHref = user ? "/items/new" : "/login?next=/items/new";

  return (
    <PageShell className="max-w-6xl py-6 md:py-10">
      <PageSection className="space-y-5 md:space-y-6">
        <PwaInstallCard />

        <HeroPanel className="space-y-4 bg-[#f9efe2] p-panel-lg">
          <p className="type-meta">{user ? displayName ? `أهلاً ${displayName}` : "أهلاً بيك في تِسوى" : "تِسوى — Teswa"}</p>
          <h1 className="type-hero">الحاجة اللي خرجت من حياتك… ممكن تبدأ حكاية عند حد تاني.</h1>
          <p className="type-body text-app-text-secondary">تِسوى مش سوق تقليدي. دي مساحة تشوف فيها قيمة الحاجات وهي بتتغيّر من شخص لشخص.</p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href={heroPrimaryHref} size="lg">افتح لها باب عروض</ButtonLink>
            <ButtonLink href="/items" variant="secondary" size="lg">اتفرج على الاحتمالات</ButtonLink>
          </div>
        </HeroPanel>

        {user && showPriorityBadge ? (
          <SoftPanel className="space-y-3">
            <div className="flex items-center gap-2">
              <StatusPill tone="warning">في حاجة محتاجة انتباهك</StatusPill>
              <h2 className="type-card-title">{priorityTitle}</h2>
            </div>
            <p className="type-support">{prioritySubtitle}</p>
            <ButtonLink href={priorityCtaPrimary.href} variant="secondary">{priorityCtaPrimary.label}</ButtonLink>
          </SoftPanel>
        ) : null}

        <PossibilityRail
          title="فاتحين باب المفاجآت"
          subtitle="أصحاب الحاجات دي سايبين مساحة للناس تقول هي شايفاها تِسوى إيه."
          items={surpriseItems.slice(0, 6)}
        />

        {curiosityItems.length ? (
          <HighlightPanel className="space-y-4">
            <div>
              <p className="type-meta">إنت شايف دي تِسوى إيه؟</p>
              <h2 className="type-card-title mt-1">لو الحاجة دي شدت عينك، إيه أول حاجة كنت ممكن تعرضها عليها؟</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {curiosityItems.map((item) => (
                <Link key={item.id} href={itemHref(item)} className="rounded-surface-compact border border-app-border bg-app-surface p-3">
                  <p className="type-card-title line-clamp-1">{item.title || "حاجة بدون عنوان"}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-app-text-secondary">{itemLine(item)}</p>
                  <p className="mt-3 text-xs text-app-text-muted">افتح التفاصيل وابدأ اقتراح مناسب.</p>
                </Link>
              ))}
            </div>
          </HighlightPanel>
        ) : null}

        <PossibilityRail
          title="حاجات ليها حكاية"
          subtitle="مش كل حاجة هنا بتتشرح بصورة وعنوان فقط."
          items={storyItems.slice(0, 6)}
        />

        {showMotionEntry ? <SoftPanel><h2 className="type-card-title">حركة القيمة في تِسوى</h2><p className="type-support mt-1">شوف حاجات بدأت تستقبل اقتراحات، حكايات خرجت للنور، ودروب بتجمع زوايا مختلفة من العالم.</p><div className="mt-3"><ButtonLink href="/drops" variant="secondary">افتح حركة القيمة</ButtonLink></div></SoftPanel> : null}

        {user ? (
          <section className="grid gap-3 sm:grid-cols-3">
            <SurfaceCard className="p-0"><Link className="block p-4" href="/dashboard"><p className="type-card-title">حسابي وعروضي</p><p className="type-meta mt-1">اختصار سريع لمتابعة نشاطك.</p></Link></SurfaceCard>
            <SurfaceCard className="p-0"><Link className="block p-4" href="/messages"><p className="type-card-title">مركز الرسائل</p><p className="type-meta mt-1">محادثات التنسيق في مكان واحد.</p></Link></SurfaceCard>
            <SurfaceCard className="p-0"><Link className="block p-4" href="/profile"><p className="type-card-title">{profileQuickLinkLabel}</p><p className="type-meta mt-1">عدّل صورتك ومعلوماتك بسرعة.</p></Link></SurfaceCard>
          </section>
        ) : (
          <SurfaceCard className="space-y-3">
            <h2 className="type-card-title">إزاي تدخل العالم ده بسرعة؟</h2>
            <ol className="grid gap-2 sm:grid-cols-3">
              {["اعرض حاجة", "سيب الناس تقترح", "اختار العرض اللي يفتح معنى جديد"].map((step, index) => (
                <li key={step} className="rounded-surface-compact border border-app-border bg-app-soft p-3 text-sm font-medium text-app-text-primary"><span className="type-meta mb-1 block">خطوة {index + 1}</span>{step}</li>
              ))}
            </ol>
            <InlineNotice tone="accent">التبادل الحقيقي يكون في مكان عام وآمن وبعد اتفاق واضح داخل تِسوى.</InlineNotice>
          </SurfaceCard>
        )}

        {user && showOnboardingChecklist ? (
          <HighlightPanel className="space-y-4">
            <div>
              <p className="type-meta">خطوتين خفاف</p>
              <h2 className="type-card-title mt-1">كمّلهم علشان فرصك تبان أسرع</h2>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center justify-between gap-3 rounded-surface-compact border border-app-border bg-app-surface p-3"><span className="font-medium text-app-text-primary">{isProfileComplete ? "✅ أكملت بروفايلك" : "◻️ أكمل بروفايلك"}</span><ButtonLink href="/profile" variant="quiet" size="compact">افتح</ButtonLink></li>
              <li className="flex items-center justify-between gap-3 rounded-surface-compact border border-app-border bg-app-surface p-3"><span className="font-medium text-app-text-primary">{hasActiveItems ? "✅ عرضت أول حاجة" : "◻️ اعرض أول حاجة"}</span><ButtonLink href="/items/new" variant="quiet" size="compact">ابدأ</ButtonLink></li>
            </ul>
          </HighlightPanel>
        ) : null}

        <SurfaceCard className="space-y-3">
          <div>
            <h2 className="type-card-title">ناس بتفتح للحاجات أبواب جديدة</h2>
            <p className="type-support mt-1">لفّة سريعة على مجتمع تِسوى والناس اللي بتحرك الاحتمالات.</p>
          </div>
          <ButtonLink href="/people" variant="secondary">استكشف الناس</ButtonLink>
        </SurfaceCard>
      </PageSection>
    </PageShell>
  );
}
