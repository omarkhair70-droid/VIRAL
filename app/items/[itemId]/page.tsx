import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShareActions } from "@/components/share-actions";
import { TrustBadges } from "@/components/trust-badges";
import { AppIcon } from "@/components/ui/app-icon";
import { ButtonLink } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { buildTrustBadges, type TrustCounts } from "@/lib/trust-badges";
import { createClient } from "@/lib/supabase/server";
import { ItemDetailGallery } from "./_components/item-detail-gallery";
import { HeroPanel, HighlightPanel, InlineNotice, PageSection, PageShell, SoftPanel, SurfaceCard } from "@/components/ui/surfaces";
import { MediaFrame } from "@/components/ui/product-primitives";

type MaybeArray<T> = T | T[] | null | undefined;

function firstOrNull<T>(value: MaybeArray<T>): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

type ItemStatus = "active" | "archived" | "reserved" | "swapped" | "removed";

type ItemMetadataRow = {
  id: string;
  title: string;
  description: string | null;
  status: ItemStatus;
  item_images: Array<{ image_url: string | null; is_primary: boolean | null }> | null;
};

type ItemDetailRawRow = {
  id: string;
  owner_id: string;
  status: ItemStatus;
  title: string;
  description: string | null;
  condition: "almost_new" | "good_used" | "minor_issues" | "needs_repair";
  condition_notes: string | null;
  city: string | null;
  area: string | null;
  desire_mode: "specific" | "flexible" | "surprise";
  desire_text: string | null;
  item_story: string | null;
  swap_reason: string | null;
  good_for: string | null;
  created_at: string;
  categories: MaybeArray<{ name_ar: string | null }>;
  item_images: Array<{ image_url: string | null; is_primary: boolean | null }> | null;
  item_wanted_tags: Array<{ tag: string }> | null;
  profiles: MaybeArray<{ display_name: string | null; username: string | null; city: string | null; successful_swaps_count: number | null; avatar_url: string | null }>;
};

const PUBLIC_METADATA_STATUSES: ItemStatus[] = ["active", "reserved", "swapped"];
const conditionLabels = {
  almost_new: "جديد تقريبًا",
  good_used: "مستخدم بحالة كويسة",
  minor_issues: "فيه عيوب بسيطة",
  needs_repair: "محتاج تصليح / عارف حالته",
};
const desireLabels = {
  specific: "بدور على حاجة معينة",
  flexible: "مرن في نوع الحاجة",
  surprise: "مفتوح لأي حاجة مناسبة",
};

export async function generateMetadata({ params }: { params: Promise<{ itemId: string }> }): Promise<Metadata> {
  const { itemId } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("items").select("id,title,description,status,item_images(image_url,is_primary)").eq("id", itemId).maybeSingle();

  const item = data as ItemMetadataRow | null;
  if (!item || !PUBLIC_METADATA_STATUSES.includes(item.status)) {
    return {
      title: "إعلان على تِسوى",
      description: "شوف الإعلانات العامة على تِسوى.",
    };
  }

  const imageUrl = item.item_images?.find((img) => img.is_primary)?.image_url ?? item.item_images?.[0]?.image_url ?? null;
  const description = item.description || "شوف الإعلان ده على تِسوى.";

  return {
    title: `${item.title} | تِسوى`,
    description,
    openGraph: {
      title: `${item.title} | تِسوى`,
      description,
      type: "website",
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title: `${item.title} | تِسوى`,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function ItemDetailPage({ params, searchParams }: { params: Promise<{ itemId: string }>; searchParams?: Promise<{ reported?: string }> }) {
  const { itemId } = await params;
  const query = (await searchParams) ?? {};
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: item, error } = await supabase
    .from("items")
    .select(
      "id,owner_id,status,title,description,condition,condition_notes,city,area,desire_mode,desire_text,item_story,swap_reason,good_for,created_at,categories(name_ar),item_images(image_url,is_primary),item_wanted_tags(tag),profiles!items_owner_id_fkey(display_name,username,city,successful_swaps_count,avatar_url)",
    )
    .eq("id", itemId)
    .maybeSingle();

  if (error || !item) notFound();
  if (item.status === "archived" && user?.id !== item.owner_id) notFound();

  const typed = item as unknown as ItemDetailRawRow;
  const sortedImages = (typed.item_images ?? [])
    .filter((x): x is { image_url: string; is_primary: boolean | null } => Boolean(x.image_url))
    .sort((a, b) => Number(b.is_primary ?? false) - Number(a.is_primary ?? false));
  const owner = firstOrNull(typed.profiles);
  const isOwner = user?.id === typed.owner_id;
  const location = [typed.city, typed.area].filter(Boolean).join(" - ");
  const hasStory = Boolean(typed.item_story || typed.swap_reason || typed.good_for);
  const moreFromOwnerQuery = await supabase
    .from("items")
    .select("id,title,city,area,item_images(image_url,is_primary)")
    .eq("owner_id", typed.owner_id)
    .eq("status", "active")
    .neq("id", typed.id)
    .order("created_at", { ascending: false })
    .limit(3);
  const { data: ownerReviewRows } = await supabase.from("reviews").select("clear_description,good_communication,on_time,respectful_swapper").eq("reviewee_id", typed.owner_id);
  const ownerTrustCounts: TrustCounts = (ownerReviewRows ?? []).reduce(
    (acc, row) => ({ clear_description: acc.clear_description + (row.clear_description ? 1 : 0), good_communication: acc.good_communication + (row.good_communication ? 1 : 0), on_time: acc.on_time + (row.on_time ? 1 : 0), respectful_swapper: acc.respectful_swapper + (row.respectful_swapper ? 1 : 0) }),
    { clear_description: 0, good_communication: 0, on_time: 0, respectful_swapper: 0 },
  );
  const ownerTrustBadges = buildTrustBadges({ counts: ownerTrustCounts, successfulSwapsCount: owner?.successful_swaps_count ?? 0, includeBeta: false });
  const moreFromOwner = (moreFromOwnerQuery.data ?? []) as Array<{ id: string; title: string; city: string | null; area: string | null; item_images: Array<{ image_url: string | null; is_primary: boolean | null }> | null }>;

  return (
    <PageShell className="max-w-6xl space-y-6">
      {query.reported === "1" ? <InlineNotice tone="accent">تم إرسال البلاغ. شكرًا إنك ساعدتنا نحافظ على التجربة.</InlineNotice> : null}

      <HeroPanel>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <StatusPill>{firstOrNull(typed.categories)?.name_ar ?? "بدون تصنيف"}</StatusPill>
            <StatusPill tone="warning">{conditionLabels[typed.condition]}</StatusPill>
            {hasStory ? <StatusPill tone="pending">ليها حكاية</StatusPill> : null}
          </div>
          <h1 className="text-3xl font-bold text-ink md:text-4xl">{typed.title}</h1>
          <p className="text-sm text-app-text-secondary">{location ? `${location} • ` : ""}اتنشر {new Date(typed.created_at).toLocaleDateString("ar-EG")}</p>
          <div className="flex flex-wrap items-center gap-3">
            {isOwner ? (
              <InlineNotice tone="warning" className="w-full sm:w-auto">
                دي حاجتك أنت.
              </InlineNotice>
            ) : (
              user ? (
                <ButtonLink href={`/offers/new?requestedItemId=${typed.id}`} className="min-w-[200px]">
                  ابعت عرض مناسب
                </ButtonLink>
              ) : (
                <ButtonLink href={`/login?next=${encodeURIComponent(`/offers/new?requestedItemId=${typed.id}`)}`} className="min-w-[200px]">
                  سجّل وابعث عرض
                </ButtonLink>
              )
            )}
            {!isOwner ? <p className="text-sm text-app-text-secondary">اختار حاجة من عندك، وصاحب الإعلان يقرر.</p> : null}
          </div>
        </div>
      </HeroPanel>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <PageSection>
            <ItemDetailGallery images={sortedImages} title={typed.title} />
          </PageSection>

          <HighlightPanel className="space-y-3">
            <p className="text-lg font-semibold">صاحبها بيدور على إيه؟</p>
            <StatusPill tone="pending">{desireLabels[typed.desire_mode]}</StatusPill>
            {typed.desire_text ? <p className="text-sm leading-7 text-app-text-secondary">{typed.desire_text}</p> : null}
            {typed.item_wanted_tags?.length ? (
              <div className="flex flex-wrap gap-2">
                {typed.item_wanted_tags.map((tag) => (
                  <span key={tag.tag} className="rounded-full border border-app-border bg-app-surface px-3 py-1 text-xs text-app-text-secondary">
                    {tag.tag}
                  </span>
                ))}
              </div>
            ) : null}
          </HighlightPanel>

          {hasStory ? (
            <SoftPanel className="space-y-3">
              <p className="flex items-center gap-2 text-lg font-semibold text-ink">
                <AppIcon name="story" className="h-4 w-4 text-clay" />
                حكاية الحاجة
              </p>
              {typed.item_story ? <p className="leading-8 text-app-text-secondary">{typed.item_story}</p> : null}
              {typed.swap_reason ? <p className="text-sm text-app-text-secondary"><span className="font-medium text-ink">ليه بيتبدّل؟ </span>{typed.swap_reason}</p> : null}
              {typed.good_for ? <p className="text-sm text-app-text-secondary"><span className="font-medium text-ink">مناسب لمين؟ </span>{typed.good_for}</p> : null}
            </SoftPanel>
          ) : null}

          <SurfaceCard className="space-y-3">
            <p className="text-lg font-semibold">الحالة والتفاصيل</p>
            <p className="text-sm font-medium text-ink">{conditionLabels[typed.condition]}</p>
            {typed.condition_notes ? <p className="text-sm leading-7 text-app-text-secondary">{typed.condition_notes}</p> : null}
            {typed.description ? <p className="text-sm leading-7 text-app-text-secondary">{typed.description}</p> : null}
          </SurfaceCard>

          {moreFromOwner.length ? (
            <SurfaceCard className="space-y-4">
              <p className="text-lg font-semibold">حاجات تانية من نفس الشخص</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {moreFromOwner.map((other) => {
                  const otherImage = other.item_images?.find((x) => x.is_primary)?.image_url ?? other.item_images?.[0]?.image_url ?? null;
                  return (
                    <Link key={other.id} href={`/items/${other.id}`} className="rounded-surface-compact border border-app-border bg-app-surface p-2 transition hover:bg-app-soft">
                      <MediaFrame src={otherImage} alt={other.title} ratio="square" />
                      <p className="mt-2 line-clamp-2 text-sm font-semibold">{other.title}</p>
                      <p className="mt-1 text-xs text-app-text-muted">{[other.city, other.area].filter(Boolean).join(" - ") || "بدون موقع"}</p>
                    </Link>
                  );
                })}
              </div>
            </SurfaceCard>
          ) : null}
        </div>

        <aside className="space-y-4">
          {!isOwner ? (
            <SurfaceCard className="space-y-3">
              <p className="flex items-center gap-2 text-base font-semibold">
                <AppIcon name="swap" className="h-4 w-4 text-clay" />
                جاهز للمقايضة؟
              </p>
              {user ? (
                <ButtonLink href={`/offers/new?requestedItemId=${typed.id}`} className="w-full">
                  ابعت عرض
                </ButtonLink>
              ) : (
                <ButtonLink href={`/login?next=${encodeURIComponent(`/offers/new?requestedItemId=${typed.id}`)}`} className="w-full">
                  سجّل وابعث عرض
                </ButtonLink>
              )}
              <p className="text-xs text-app-text-muted">اختار حاجة من عندك، وصاحب الإعلان يقرر.</p>
            </SurfaceCard>
          ) : null}

          <SurfaceCard className="space-y-3">
            <p className="flex items-center gap-2 font-semibold"><AppIcon name="profile" className="h-4 w-4 text-clay" />صاحب الإعلان</p>
            <div className="flex items-center gap-3">
              {owner?.avatar_url ? (
                <img src={owner.avatar_url} alt={owner.display_name ?? "مستخدم"} className="h-12 w-12 rounded-full object-cover" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-app-soft text-sm font-semibold text-ink">{(owner?.display_name ?? "م").charAt(0)}</div>
              )}
              <div>
                <p className="font-medium text-ink">{owner?.display_name ?? "مستخدم"}</p>
                {owner?.city ? <p className="text-xs text-app-text-muted">{owner.city}</p> : null}
                <p className="text-xs text-app-text-muted">مقايضات ناجحة: {owner?.successful_swaps_count ?? 0}</p>
              </div>
            </div>
            <TrustBadges badges={ownerTrustBadges} compact maxVisible={3} />
            {owner?.username ? (
              <Link href={`/users/${owner.username}`} className="inline-flex min-h-10 items-center justify-center rounded-xl border border-app-border bg-app-surface px-3 py-2 text-sm font-medium text-ink transition hover:bg-app-soft">
                شوف البروفايل
              </Link>
            ) : null}
          </SurfaceCard>

          <InlineNotice>
            <span className="inline-flex items-center gap-2"><AppIcon name="shield" className="h-3.5 w-3.5 text-app-text-muted" />اتفقوا في مكان عام، وراجعوا التفاصيل قبل تأكيد المقايضة.</span>
          </InlineNotice>

          <SurfaceCard className="space-y-3">
            <ShareActions label={isOwner ? "شارك إعلانك" : "شارك الإعلان"} title={typed.title} text="شوف الإعلان ده على تِسوى — بدّل الحاجة بدل ما تسيبها مركونة." urlPath={`/items/${typed.id}`} />
            {isOwner ? (
              <div className="flex gap-2">
                <Link href={`/items/${typed.id}/edit`} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-app-border bg-app-surface px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-app-soft">
                  عدّل الإعلان
                </Link>
                <ButtonLink href="/dashboard/items" variant="secondary">إدارة حاجاتي</ButtonLink>
              </div>
            ) : null}
            {user && !isOwner ? <Link href={`/report?itemId=${typed.id}&returnTo=${encodeURIComponent(`/items/${typed.id}`)}`} className="inline-block text-sm text-app-text-muted hover:underline">بلّغ عن الإعلان</Link> : null}
          </SurfaceCard>
        </aside>
      </div>
    </PageShell>
  );
}
