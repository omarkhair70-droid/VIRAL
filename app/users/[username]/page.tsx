import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShareActions } from "@/components/share-actions";
import { TrustBadges } from "@/components/trust-badges";
import { ButtonLink } from "@/components/ui/button";
import { MediaFrame, MetricPill, TrustChip } from "@/components/ui/product-primitives";
import { HeroPanel, HighlightPanel, InlineNotice, PageSection, PageShell, SoftPanel, SurfaceCard } from "@/components/ui/surfaces";
import { buildTrustBadges, selectedTrustTraitsFromReview, type TrustCounts } from "@/lib/trust-badges";
import { createClient } from "@/lib/supabase/server";

type ProfileRow = { id: string; display_name: string; username: string | null; bio: string | null; city: string | null; area: string | null; created_at: string; successful_swaps_count: number; avatar_url?: string | null; cover_url?: string | null; profile_tagline?: string | null; interests?: string | null; preferred_categories?: string | null; swap_preferences?: string | null; };
type ReviewRow = { id: string; rating: number; comment: string | null; created_at: string; clear_description: boolean; good_communication: boolean; on_time: boolean; respectful_swapper: boolean; reviewer: { display_name: string | null; username: string | null }[] | null; };
const genericProfileMetadata: Metadata = { title: "بروفايل على تِسوى", description: "بروفايل مقايضات وتقييمات على تِسوى." };
const isSafePublicImageUrl = (url: string) => url.startsWith("https://") || url.startsWith("http://");

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> { const { username } = await params; if (!username) return genericProfileMetadata; const supabase = await createClient(); const { data } = await supabase.from("profiles").select("username,display_name,bio,avatar_url").eq("username", username.toLowerCase()).maybeSingle(); const p = data as Pick<ProfileRow, "username" | "display_name" | "bio" | "avatar_url"> | null; if (!p?.username) return genericProfileMetadata; const n = p.display_name || p.username; const d = p.bio || genericProfileMetadata.description!; const a = p.avatar_url && isSafePublicImageUrl(p.avatar_url) ? p.avatar_url : null; return { title: `${n} على تِسوى`, description: d, openGraph: { title: `${n} على تِسوى`, description: d, type: "profile", images: a ? [{ url: a }] : undefined }, twitter: { card: a ? "summary_large_image" : "summary", title: `${n} على تِسوى`, description: d, images: a ? [a] : undefined } }; }

export default async function UserProfilePage({ params, searchParams }: { params: Promise<{ username: string }>; searchParams?: Promise<{ reported?: string }> }) {
  const { username } = await params; const query = (await searchParams) ?? {}; const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("id,display_name,username,bio,city,area,created_at,successful_swaps_count,avatar_url,cover_url,profile_tagline,interests,preferred_categories,swap_preferences").eq("username", username.toLowerCase()).maybeSingle();
  if (!profile) notFound(); const typed = profile as ProfileRow;
  const [{ data: items }, { count: dealsCount }, { data: reviewsData }, { data: avgRows }] = await Promise.all([
    supabase.from("items").select("id,title,city,area,created_at,item_story,swap_reason,good_for,item_images(image_url,is_primary)").eq("owner_id", typed.id).eq("status", "active").order("created_at", { ascending: false }).limit(6),
    supabase.from("swap_deals").select("id", { count: "exact", head: true }).or(`requester_id.eq.${typed.id},offerer_id.eq.${typed.id}`),
    supabase.from("reviews").select("id,rating,comment,created_at,clear_description,good_communication,on_time,respectful_swapper,reviewer:profiles!reviews_reviewer_id_fkey(display_name,username)").eq("reviewee_id", typed.id).order("created_at", { ascending: false }).limit(3),
    supabase.from("reviews").select("rating,clear_description,good_communication,on_time,respectful_swapper").eq("reviewee_id", typed.id),
  ]);
  const latestReviews = (reviewsData as ReviewRow[] | null) ?? []; const reviewCount = avgRows?.length ?? 0; const averageRating = reviewCount > 0 ? (avgRows ?? []).reduce((s, r) => s + r.rating, 0) / reviewCount : null;
  const trustCounts: TrustCounts = (avgRows ?? []).reduce((acc, row) => ({ clear_description: acc.clear_description + (row.clear_description ? 1 : 0), good_communication: acc.good_communication + (row.good_communication ? 1 : 0), on_time: acc.on_time + (row.on_time ? 1 : 0), respectful_swapper: acc.respectful_swapper + (row.respectful_swapper ? 1 : 0) }), { clear_description: 0, good_communication: 0, on_time: 0, respectful_swapper: 0 });
  const trustBadges = buildTrustBadges({ counts: trustCounts, successfulSwapsCount: typed.successful_swaps_count, includeBeta: true });
  const displayName = typed.display_name || typed.username || "مستخدم"; const location = [typed.city, typed.area].filter(Boolean).join(" - ");

  return (
    <PageShell>
      <PageSection>
        <HeroPanel className="overflow-hidden p-0">
          <MediaFrame src={typed.cover_url} alt={`غلاف ${displayName}`} ratio="hero" fallback={<div className="h-full w-full bg-gradient-to-r from-stone-200 to-amber-100" />} />
          <div className="space-y-4 p-panel-lg">
            <div className="-mt-20 inline-flex rounded-full border-4 border-app-surface bg-app-surface">
              {typed.avatar_url ? (
                <img src={typed.avatar_url} alt={displayName} className="h-24 w-24 rounded-full object-cover" />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-app-soft text-2xl font-bold text-app-text-secondary">{displayName.charAt(0)}</div>
              )}
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold text-app-text-primary">{displayName}</h1>
              <p className="text-sm text-app-text-muted">@{typed.username}</p>
              {typed.profile_tagline ? <p className="text-base text-app-text-secondary">{typed.profile_tagline}</p> : null}
              <p className="text-sm text-app-text-muted">{location || "لسه مكملش بيانات المكان"} • عضو من {new Date(typed.created_at).toLocaleDateString("ar-EG")}</p>
              {typed.bio ? <p className="max-w-3xl text-sm text-app-text-secondary">{typed.bio}</p> : null}
            </div>
          </div>
        </HeroPanel>

        <SurfaceCard className="space-y-3">
          <p className="text-sm text-app-text-secondary">لو تعرف حد مهتم بنفس النوع من المقايضات، شاركه البروفايل ده.</p>
          {typed.username ? <ShareActions label="شارك البروفايل" title={`${displayName} على تِسوى`} text="شوف بروفايل المقايضات والتقييمات على تِسوى." urlPath={`/users/${typed.username}`} /> : null}
          {query.reported === "1" ? <InlineNotice tone="warning">تم إرسال البلاغ. شكرًا إنك ساعدتنا نحافظ على التجربة.</InlineNotice> : null}
          {user && user.id !== typed.id ? <Link href={`/report?username=${encodeURIComponent(username)}&returnTo=${encodeURIComponent(`/users/${username}`)}`} className="text-sm text-app-text-muted underline underline-offset-2">بلّغ عن المستخدم</Link> : null}
        </SurfaceCard>

        <HighlightPanel className="space-y-3">
          <h2 className="text-lg font-semibold text-app-text-primary">ملخص النشاط والسمعة</h2>
          <div className="flex flex-wrap gap-2">
            <MetricPill label="حاجات متاحة" value={items?.length ?? 0} />
            <MetricPill label="مقايضات مكتملة" value={typed.successful_swaps_count} />
            <MetricPill label="كل التقييمات" value={reviewCount} />
            <MetricPill label="متوسط التقييم" value={averageRating ? averageRating.toFixed(1) : "-"} />
          </div>
          <p className="text-xs text-app-text-muted">صفقات مقبولة: {dealsCount ?? 0}</p>
        </HighlightPanel>

        <SurfaceCard className="space-y-3">
          <h2 className="text-lg font-semibold text-app-text-primary">سمعة المقايضة</h2>
          <p className="text-sm text-app-text-secondary">الإشارات دي مبنية من مقايضات مكتملة وتقييمات فعلية على تِسوى.</p>
          {trustBadges.length ? <TrustBadges badges={trustBadges} /> : <InlineNotice>لسه مفيش إشارات ثقة كفاية تظهر هنا.</InlineNotice>}
        </SurfaceCard>

        <SurfaceCard className="space-y-3">
          <h2 className="text-xl font-semibold text-app-text-primary">بيحب يبدّل إيه؟</h2>
          {typed.interests || typed.preferred_categories || typed.swap_preferences ? (
            <div className="grid gap-2 text-sm text-app-text-secondary">
              {typed.interests ? <SoftPanel className="space-y-1"><p className="type-label">اهتماماته</p><p>{typed.interests}</p></SoftPanel> : null}
              {typed.preferred_categories ? <SoftPanel className="space-y-1"><p className="type-label">الفئات المفضلة</p><p>{typed.preferred_categories}</p></SoftPanel> : null}
              {typed.swap_preferences ? <SoftPanel className="space-y-1"><p className="type-label">تفضيلاته</p><p>{typed.swap_preferences}</p></SoftPanel> : null}
            </div>
          ) : (
            <InlineNotice>لسه ما كتبش اهتماماته في المقايضة.</InlineNotice>
          )}
        </SurfaceCard>

        <SurfaceCard className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-app-text-primary">آراء الناس بعد المقايضة</h2>
            <p className="text-sm text-app-text-secondary">الآراء دي بتظهر بعد مقايضات مكتملة فقط.</p>
            <p className="text-sm text-app-text-muted">متوسط التقييم: {averageRating ? averageRating.toFixed(1) : "-"} • عدد التقييمات: {reviewCount}</p>
          </div>
          {latestReviews.length ? latestReviews.map((review) => {
            const reviewer = review.reviewer?.[0];
            const selectedSignals = selectedTrustTraitsFromReview(review);
            return (
              <SoftPanel key={review.id} className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-app-text-primary">{reviewer?.display_name ?? reviewer?.username ?? "مستخدم"}</p>
                  <p className="text-xs text-app-text-muted">{new Date(review.created_at).toLocaleDateString("ar-EG")}</p>
                </div>
                <p className="text-sm text-app-text-secondary">التقييم: {review.rating}/5</p>
                {review.comment ? <p className="text-sm text-app-text-secondary">{review.comment}</p> : null}
                {selectedSignals.length ? <div className="flex flex-wrap gap-1.5">{selectedSignals.map((signal) => <TrustChip key={signal} tone="meta" dense>{signal}</TrustChip>)}</div> : null}
              </SoftPanel>
            );
          }) : <InlineNotice>لسه مفيش تقييمات.</InlineNotice>}
        </SurfaceCard>

        <SurfaceCard className="space-y-3">
          <h2 className="text-xl font-semibold text-app-text-primary">الحاجات المتاحة منه</h2>
          {items?.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {items.map((item) => {
                const image = Array.isArray((item as { item_images?: { image_url: string; is_primary: boolean }[] }).item_images) ? (item as { item_images?: { image_url: string; is_primary: boolean }[] }).item_images?.find((img) => img.is_primary)?.image_url ?? (item as { item_images?: { image_url: string; is_primary: boolean }[] }).item_images?.[0]?.image_url : null;
                return (
                  <Link key={item.id} href={`/items/${item.id}`} className="rounded-surface-compact border border-app-border bg-app-surface p-3 transition hover:border-app-accent/40 hover:bg-app-soft">
                    <MediaFrame src={image} alt={item.title} ratio="wide" />
                    <div className="mt-2 space-y-1">
                      {(item as { item_story?: string | null; swap_reason?: string | null; good_for?: string | null }).item_story || (item as { swap_reason?: string | null }).swap_reason || (item as { good_for?: string | null }).good_for ? <TrustChip tone="info" dense>ليها حكاية</TrustChip> : null}
                      <p className="font-semibold text-app-text-primary">{item.title}</p>
                      <p className="text-sm text-app-text-muted">{[item.city, item.area].filter(Boolean).join(" - ") || "بدون موقع"}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <InlineNotice>لسه مفيش حاجات متاحة للمقايضة.</InlineNotice>
          )}
          {user?.id === typed.id ? <ButtonLink href="/items/new" variant="outline" size="sm">اعرض حاجة جديدة</ButtonLink> : null}
        </SurfaceCard>
      </PageSection>
    </PageShell>
  );
}
