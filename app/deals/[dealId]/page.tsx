import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DealMessageForm } from "@/components/deals/deal-message-form";
import { DealMessageThread } from "@/components/deals/deal-message-thread";
import { AppIcon } from "@/components/ui/app-icon";
import { Button } from "@/components/ui/button";
import { Field, Label, Select, Textarea } from "@/components/ui/form";
import { MediaFrame } from "@/components/ui/product-primitives";
import { StatusPill } from "@/components/ui/status-pill";
import { HeroPanel, HighlightPanel, InlineNotice, PageSection, PageShell, SoftPanel, SurfaceCard } from "@/components/ui/surfaces";
import { createClient } from "@/lib/supabase/server";
import { confirmDealCompleted, submitDealReview } from "./actions";

type MaybeArray<T> = T | T[] | null | undefined;
function firstOrNull<T>(value: MaybeArray<T>): T | null { if (!value) return null; return Array.isArray(value) ? value[0] ?? null : value; }
function pickPrimaryImage(images: Array<{ image_url: string | null; is_primary: boolean | null }> | null): string | null { if (!images?.length) return null; return images.find((image) => image.is_primary && image.image_url)?.image_url ?? images.find((image) => image.image_url)?.image_url ?? null; }

type ItemJoin = { id: string; title: string; item_images: Array<{ image_url: string | null; is_primary: boolean | null }> | null; };
type ProfileJoin = { display_name: string | null; username: string | null; avatar_url: string | null; city: string | null };
type DealStatus = "coordinating" | "completed_pending_confirmation" | "completed" | "cancelled" | "disputed";
type DealRow = { id: string; created_at: string; offer_id: string; status: DealStatus; requester_id: string; offerer_id: string; requester: MaybeArray<ProfileJoin>; offerer: MaybeArray<ProfileJoin>; offered_item: MaybeArray<ItemJoin>; requested_item: MaybeArray<ItemJoin>; };
type DealMessageRow = { id: string; sender_id: string; body: string; created_at: string; sender: MaybeArray<{ display_name: string | null; username: string | null }>; };

const messageErrorMap: Record<string, string> = { empty: "اكتب رسالة الأول.", too_long: "الرسالة طويلة زيادة.", not_allowed: "مش مسموح تبعت رسالة في الصفقة دي.", send_failed: "مش قادرين نبعت الرسالة دلوقتي. جرّب تاني.", rate_limited: "استنى دقيقة قبل ما تبعت رسائل تانية." };
const statusConfig: Record<DealStatus, { label: string; tone: "pending" | "success" | "muted" | "warning"; nextStep: string }> = {
  coordinating: { label: "جاري التنسيق", tone: "pending", nextStep: "اتفقوا على التفاصيل في الرسائل." },
  completed_pending_confirmation: { label: "مستني تأكيد الطرفين", tone: "pending", nextStep: "طرف أكد الإتمام. مستنيين الطرف التاني." },
  completed: { label: "تمت المقايضة", tone: "success", nextStep: "المقايضة تمت. سيب تقييمك." },
  cancelled: { label: "اتلغت", tone: "muted", nextStep: "الصفقة اتلغت." },
  disputed: { label: "عليها مشكلة", tone: "warning", nextStep: "فيه مشكلة محتاجة مراجعة." },
};

export default async function DealDetailPage({ params, searchParams }: { params: Promise<{ dealId: string }>; searchParams?: Promise<{ reported?: string; message?: string; messageError?: string }> }) {
  const { dealId } = await params;
  const query = (await searchParams) ?? {};
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/deals/${dealId}`);
  const { data } = await supabase.from("swap_deals").select("id,created_at,offer_id,status,requester_id,offerer_id,requester:profiles!swap_deals_requester_id_fkey(display_name,username,avatar_url,city),offerer:profiles!swap_deals_offerer_id_fkey(display_name,username,avatar_url,city),offered_item:items!swap_deals_offered_item_id_fkey(id,title,item_images(image_url,is_primary)),requested_item:items!swap_deals_requested_item_id_fkey(id,title,item_images(image_url,is_primary))").eq("id", dealId).maybeSingle();
  if (!data) notFound();
  const deal = data as unknown as DealRow;
  if (user.id !== deal.requester_id && user.id !== deal.offerer_id) notFound();
  await supabase.rpc("mark_deal_thread_read", { p_deal_id: deal.id });

  const offered = firstOrNull(deal.offered_item); const requested = firstOrNull(deal.requested_item); if (!offered || !requested) notFound();
  const offererProfile = firstOrNull(deal.offerer); const requesterProfile = firstOrNull(deal.requester);
  const otherParticipantId = user.id === deal.requester_id ? deal.offerer_id : deal.requester_id;
  const otherParticipantProfile = user.id === deal.requester_id ? offererProfile : requesterProfile;

  const [{ data: confirmations }, { data: myReview }, { data: messageRows }] = await Promise.all([
    supabase.from("deal_confirmations").select("user_id").eq("deal_id", deal.id),
    supabase.from("reviews").select("id").eq("deal_id", deal.id).eq("reviewer_id", user.id).eq("reviewee_id", otherParticipantId).maybeSingle(),
    supabase.from("deal_messages").select("id,sender_id,body,created_at,sender:profiles!deal_messages_sender_id_fkey(display_name,username)").eq("deal_id", deal.id).order("created_at", { ascending: true }).limit(100),
  ]);

  const confirmedIds = new Set((confirmations ?? []).map((row) => row.user_id));
  const iConfirmed = confirmedIds.has(user.id); const otherConfirmed = confirmedIds.has(otherParticipantId);
  const canSendMessage = deal.status === "coordinating" || deal.status === "completed_pending_confirmation";
  const stepIndex = deal.status === "coordinating" ? 2 : deal.status === "completed_pending_confirmation" ? 3 : deal.status === "completed" ? 4 : null;
  const messages = ((messageRows as DealMessageRow[] | null) ?? []).map((row) => ({ id: row.id, senderId: row.sender_id, senderName: firstOrNull(row.sender)?.display_name ?? firstOrNull(row.sender)?.username ?? "مستخدم", body: row.body, createdAt: row.created_at }));
  const participants = [{ id: deal.requester_id, profile: requesterProfile, roleLabel: user.id === deal.requester_id ? "أنت" : "الطرف التاني" }, { id: deal.offerer_id, profile: offererProfile, roleLabel: user.id === deal.offerer_id ? "أنت" : "الطرف التاني" }];

  return <PageShell className="mx-auto max-w-6xl px-4 py-8"><PageSection className="space-y-6">
    <HeroPanel className="space-y-3"><div className="flex flex-wrap items-center gap-2"><h1 className="text-3xl font-bold">غرفة الصفقة</h1><StatusPill tone={statusConfig[deal.status].tone}>{statusConfig[deal.status].label}</StatusPill></div><p className="text-sm text-app-text-secondary">{statusConfig[deal.status].nextStep}</p><p className="text-xs text-app-text-muted">تاريخ القبول: {new Date(deal.created_at).toLocaleDateString("ar-EG")}</p></HeroPanel>
    {query.reported === "1" ? <InlineNotice tone="accent">تم إرسال البلاغ. شكرًا إنك ساعدتنا نحافظ على التجربة.</InlineNotice> : null}

    <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      <div className="space-y-6">
        <SurfaceCard className="space-y-4 p-4 md:p-5"><p className="flex items-center gap-2 text-sm text-app-text-secondary"><AppIcon name="swap" className="size-4 text-clay" />ملخص المقايضة</p><div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center"><SoftPanel className="space-y-2"><p className="text-sm text-app-text-muted">الحاجة المعروضة</p><MediaFrame src={pickPrimaryImage(offered.item_images)} alt={offered.title} ratio="square" /><Link href={`/items/${offered.id}`} className="block font-semibold hover:underline">{offered.title}</Link></SoftPanel><div className="text-center text-3xl text-clay">↔</div><SoftPanel className="space-y-2"><p className="text-sm text-app-text-muted">الحاجة المطلوبة</p><MediaFrame src={pickPrimaryImage(requested.item_images)} alt={requested.title} ratio="square" /><Link href={`/items/${requested.id}`} className="block font-semibold hover:underline">{requested.title}</Link></SoftPanel></div></SurfaceCard>

        <SurfaceCard id="messages" className="space-y-4 p-4 md:p-5"><div className="space-y-1"><h2 className="flex items-center gap-2 text-xl font-semibold"><AppIcon name="chat" className="size-5 text-clay" />رسائل تنسيق الصفقة</h2><p className="text-sm text-app-text-secondary">الرسائل هنا للتنسيق فقط. التحديث اللحظي شغال وقت التنسيق، وهتلاقي الرسائل الجديدة بتظهر تلقائيًا.</p><p className="text-sm text-app-text-secondary">ما تشاركش بيانات حساسة بدري، ولو في رسالة مش مريحة بلّغ عنها.</p></div>
          {query.message === "sent" ? <InlineNotice tone="accent">تم إرسال الرسالة.</InlineNotice> : null}
          {query.messageError ? <InlineNotice tone="danger">{messageErrorMap[query.messageError] ?? messageErrorMap.send_failed}</InlineNotice> : null}
          <DealMessageThread messages={messages} currentUserId={user.id} dealId={deal.id} otherParticipantName={otherParticipantProfile?.display_name ?? otherParticipantProfile?.username ?? "مستخدم"} />
          {canSendMessage ? <DealMessageForm dealId={deal.id} /> : <SoftPanel className="text-sm text-app-text-secondary">الرسائل اتقفلت لأن حالة الصفقة اتغيرت. تقدر ترجع للرسائل القديمة بس.</SoftPanel>}
          {otherParticipantProfile?.display_name || otherParticipantProfile?.username ? <p className="text-xs text-app-text-muted">أنت بتنسّق حاليًا مع {otherParticipantProfile.display_name ?? otherParticipantProfile.username}.</p> : null}
        </SurfaceCard>

        {(deal.status === "coordinating" || deal.status === "completed_pending_confirmation") ? <HighlightPanel className="space-y-3"><h2 className="flex items-center gap-2 text-xl font-semibold"><AppIcon name="check" className="size-5 text-clay" />تأكيد إتمام المقايضة</h2><InlineNotice tone="warning">ما تضغطش تأكيد الإتمام غير بعد ما المقايضة تحصل فعلًا.</InlineNotice>{!iConfirmed && !otherConfirmed ? <p className="text-sm text-app-text-secondary">بعد ما المقايضة تحصل، كل طرف يأكد الإتمام من هنا.</p> : null}{(iConfirmed !== otherConfirmed) ? <p className="text-sm text-app-text-secondary">مستنيين تأكيد الطرف التاني. لو المقايضة لسه ما تمت، استنوا.</p> : null}<div className="grid gap-2 text-sm sm:grid-cols-2"><SoftPanel>أنت: {iConfirmed ? "✅ أكدت" : "⏳ لسه"}</SoftPanel><SoftPanel>الطرف التاني: {otherConfirmed ? "✅ أكد" : "⏳ لسه"}</SoftPanel></div>{!iConfirmed ? <form action={confirmDealCompleted}><input type="hidden" name="dealId" value={deal.id} /><Button type="submit" size="sm">أكد إن المقايضة تمت</Button></form> : <InlineNotice tone="accent">أنت أكدت. مستنيين الطرف التاني.</InlineNotice>}</HighlightPanel> : null}

        {deal.status === "completed" ? <HighlightPanel className="space-y-1"><p className="flex items-center gap-2 font-semibold"><AppIcon name="check" className="size-4" />المقايضة تمت بنجاح</p><p className="text-sm">الطرفين أكدوا الإتمام. دلوقتي التقييم هو الخطوة الأخيرة.</p></HighlightPanel> : null}

        {deal.status === "completed" ? <SurfaceCard className="p-4 md:p-5"><h2 className="mb-3 flex items-center gap-2 text-xl font-semibold"><AppIcon name="star" className="size-5 text-clay" />قيّم التجربة</h2>{myReview ? <InlineNotice tone="accent">تقييمك اتسجل. شكرًا إنك ساعدت تبني ثقة في تِسوى.</InlineNotice> : <form action={submitDealReview} className="space-y-3"><input type="hidden" name="dealId" value={deal.id} /><Field><Label htmlFor="rating" required>التقييم</Label><Select id="rating" name="rating" defaultValue="5" required>{[5,4,3,2,1].map((rating) => <option key={rating} value={rating}>{rating} / 5</option>)}</Select></Field><Field><Label htmlFor="comment" optional>تعليق</Label><Textarea id="comment" name="comment" maxLength={300} rows={4} /></Field><fieldset className="space-y-2 rounded-xl border border-stone-200 bg-stone-50 p-3"><legend className="px-1 text-sm font-medium">إيه اللي كان كويس في التجربة؟</legend><label className="flex items-center gap-2 text-sm"><input type="checkbox" name="clear_description" className="size-4 rounded border-stone-300" />وصف الحاجة كان واضح</label><label className="flex items-center gap-2 text-sm"><input type="checkbox" name="good_communication" className="size-4 rounded border-stone-300" />تواصله كان كويس</label><label className="flex items-center gap-2 text-sm"><input type="checkbox" name="on_time" className="size-4 rounded border-stone-300" />التزم بالاتفاق</label><label className="flex items-center gap-2 text-sm"><input type="checkbox" name="respectful_swapper" className="size-4 rounded border-stone-300" />محترم في التعامل</label></fieldset><Button type="submit" size="sm">ابعت التقييم</Button></form>}</SurfaceCard> : null}
      </div>

      <aside className="space-y-4">
        <SurfaceCard className="space-y-2 p-4"><p className="text-sm text-app-text-muted">حالة الصفقة</p><StatusPill tone={statusConfig[deal.status].tone}>{statusConfig[deal.status].label}</StatusPill><p className="text-sm text-app-text-secondary">{statusConfig[deal.status].nextStep}</p></SurfaceCard>
        <SurfaceCard className="p-4"><h2 className="mb-3 text-lg font-semibold">المشاركين</h2><div className="space-y-3">{participants.map((participant) => {const displayName = participant.profile?.display_name ?? participant.profile?.username ?? "مستخدم"; const avatar = participant.profile?.avatar_url; return <SoftPanel key={participant.id} className="space-y-2"><div className="flex items-center gap-3"><div className="size-10 overflow-hidden rounded-full bg-stone-100">{avatar ? <img src={avatar} alt={displayName} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-xs text-stone-500">تِسوى</div>}</div><div className="min-w-0"><p className="truncate font-medium">{displayName}</p><p className="text-xs text-stone-500">{participant.roleLabel}</p></div></div>{participant.profile?.username ? <Link href={`/users/${participant.profile.username}`} className="inline-block text-sm text-clay hover:underline">@{participant.profile.username}</Link> : null}{participant.profile?.city ? <p className="text-xs text-stone-500">{participant.profile.city}</p> : null}</SoftPanel>;})}</div></SurfaceCard>
        <SurfaceCard className="p-4"><h2 className="mb-3 text-lg font-semibold">مراحل الصفقة</h2>{stepIndex ? <ol className="space-y-2 text-sm">{["العرض اتقبل", "اتفقوا في الرسائل", "أكّدوا الإتمام", "سيبوا تقييم"].map((step, index) => {const isDone = index + 1 < stepIndex; const isCurrent = index + 1 === stepIndex; return <li key={step} className={isDone ? "text-emerald-700" : isCurrent ? "font-semibold text-clay" : "text-stone-500"}>{index + 1}. {step}</li>;})}</ol> : <p className="text-sm text-stone-600">الصفقة مش في مرحلة تنسيق حالية.</p>}<SoftPanel className="mt-3 space-y-1 text-xs text-app-text-secondary"><p>• اتفقوا على المكان والميعاد.</p><p>• راجعوا حالة الحاجة قبل التأكيد.</p><p>• أكدوا الإتمام فقط بعد التبادل الحقيقي.</p></SoftPanel></SurfaceCard>
        <SurfaceCard className="space-y-1 p-4 text-sm"><p className="mb-1 flex items-center gap-2 font-medium"><AppIcon name="shield" className="size-4 text-clay" />تذكير سريع للسلامة</p><p>اتفقوا في مكان مناسب وواضح.</p><p>راجعوا التفاصيل قبل التأكيد.</p><p>ما تشاركش بيانات حساسة بدري.</p></SurfaceCard>
        <SurfaceCard className="p-4 text-sm"><p className="mb-2 font-medium text-stone-800">روابط الغرفة</p><div className="flex flex-col gap-2"><Link href={`/offers/${deal.offer_id}`} className="text-stone-700 hover:underline">افتح العرض الأصلي</Link><Link href={`/items/${offered.id}`} className="text-stone-700 hover:underline">افتح الحاجة المعروضة</Link><Link href={`/items/${requested.id}`} className="text-stone-700 hover:underline">افتح الحاجة المطلوبة</Link><Link href={`/report?dealId=${deal.id}&returnTo=${encodeURIComponent(`/deals/${deal.id}`)}`} className="text-stone-700 hover:underline">بلّغ عن الصفقة</Link></div></SurfaceCard>
      </aside>
    </div>
  </PageSection></PageShell>;
}
