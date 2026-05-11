import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DealMessageForm } from "@/components/deals/deal-message-form";
import { DealMessageThread } from "@/components/deals/deal-message-thread";
import { createClient } from "@/lib/supabase/server";
import { confirmDealCompleted, submitDealReview } from "./actions";

type MaybeArray<T> = T | T[] | null | undefined;
function firstOrNull<T>(value: MaybeArray<T>): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

type ItemJoin = {
  id: string;
  title: string;
  item_images: Array<{ image_url: string | null; is_primary: boolean | null }> | null;
};

type DealStatus = "coordinating" | "completed_pending_confirmation" | "completed" | "cancelled" | "disputed";

type DealRow = {
  id: string;
  created_at: string;
  offer_id: string;
  status: DealStatus;
  requester_id: string;
  offerer_id: string;
  requester: MaybeArray<{ display_name: string | null; username: string | null }>;
  offerer: MaybeArray<{ display_name: string | null; username: string | null }>;
  offered_item: MaybeArray<ItemJoin>;
  requested_item: MaybeArray<ItemJoin>;
};

type DealMessageRow = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
  sender: MaybeArray<{ display_name: string | null; username: string | null }>;
};

const messageErrorMap: Record<string, string> = {
  empty: "اكتب رسالة الأول.",
  too_long: "الرسالة طويلة زيادة.",
  not_allowed: "مش مسموح تبعت رسالة في الصفقة دي.",
  send_failed: "مش قادرين نبعت الرسالة دلوقتي. جرّب تاني.",
};

export default async function DealDetailPage({ params, searchParams }: { params: Promise<{ dealId: string }>; searchParams?: Promise<{ reported?: string; message?: string; messageError?: string }> }) {
  const { dealId } = await params;
  const query = (await searchParams) ?? {};
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/deals/${dealId}`);

  const statusMap: Record<DealRow["status"], string> = {
    coordinating: "جاري التنسيق",
    completed_pending_confirmation: "مستني تأكيد الطرفين",
    completed: "تمت المقايضة",
    cancelled: "اتلغت",
    disputed: "عليها مشكلة",
  };

  const { data } = await supabase
    .from("swap_deals")
    .select("id,created_at,offer_id,status,requester_id,offerer_id,requester:profiles!swap_deals_requester_id_fkey(display_name,username),offerer:profiles!swap_deals_offerer_id_fkey(display_name,username),offered_item:items!swap_deals_offered_item_id_fkey(id,title,item_images(image_url,is_primary)),requested_item:items!swap_deals_requested_item_id_fkey(id,title,item_images(image_url,is_primary))")
    .eq("id", dealId)
    .maybeSingle();

  if (!data) notFound();
  const deal = data as unknown as DealRow;
  if (user.id !== deal.requester_id && user.id !== deal.offerer_id) notFound();

  const offered = firstOrNull(deal.offered_item);
  const requested = firstOrNull(deal.requested_item);
  if (!offered || !requested) notFound();

  const offererProfile = firstOrNull(deal.offerer);
  const requesterProfile = firstOrNull(deal.requester);
  const offererName = offererProfile?.display_name ?? "مستخدم";
  const requesterName = requesterProfile?.display_name ?? "صاحب الإعلان";
  const otherParticipantId = user.id === deal.requester_id ? deal.offerer_id : deal.requester_id;
  const otherParticipantProfile = user.id === deal.requester_id ? offererProfile : requesterProfile;

  const [{ data: confirmations }, { data: myReview }, { data: messageRows }] = await Promise.all([
    supabase.from("deal_confirmations").select("user_id").eq("deal_id", deal.id),
    supabase.from("reviews").select("id").eq("deal_id", deal.id).eq("reviewer_id", user.id).eq("reviewee_id", otherParticipantId).maybeSingle(),
    supabase
      .from("deal_messages")
      .select("id,sender_id,body,created_at,sender:profiles!deal_messages_sender_id_fkey(display_name,username)")
      .eq("deal_id", deal.id)
      .order("created_at", { ascending: true })
      .limit(100),
  ]);

  const confirmedIds = new Set((confirmations ?? []).map((row) => row.user_id));
  const iConfirmed = confirmedIds.has(user.id);
  const otherConfirmed = confirmedIds.has(otherParticipantId);
  const canSendMessage = deal.status === "coordinating" || deal.status === "completed_pending_confirmation";

  const messages = ((messageRows as DealMessageRow[] | null) ?? []).map((row) => {
    const sender = firstOrNull(row.sender);
    return {
      id: row.id,
      senderId: row.sender_id,
      senderName: sender?.display_name ?? sender?.username ?? "مستخدم",
      body: row.body,
      createdAt: row.created_at,
    };
  });

  return (
    <section className="mx-auto max-w-5xl space-y-6 px-4 py-10">
      <h1 className="text-3xl font-bold">تنسيق المقايضة</h1>
      <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900">{statusMap[deal.status]}</span>
      {query.reported === "1" ? <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-800">تم إرسال البلاغ. شكرًا إنك ساعدتنا نحافظ على التجربة.</p> : null}

      <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr]">
        <article className="rounded-2xl border bg-white p-4"><p className="mb-2 text-sm text-stone-500">الحاجة المعروضة</p><h2 className="font-semibold">{offered.title}</h2></article>
        <div className="self-center text-center text-3xl">↔</div>
        <article className="rounded-2xl border bg-white p-4"><p className="mb-2 text-sm text-stone-500">الحاجة المطلوبة</p><h2 className="font-semibold">{requested.title}</h2></article>
      </div>

      <div className="rounded-2xl border bg-stone-50 p-4 text-sm text-stone-700">
        <p>المشاركين: {offererProfile?.username ? <Link href={`/users/${offererProfile.username}`} className="hover:underline">{offererName}</Link> : offererName} و {requesterProfile?.username ? <Link href={`/users/${requesterProfile.username}`} className="hover:underline">{requesterName}</Link> : requesterName}</p>
        <p>تاريخ القبول: {new Date(deal.created_at).toLocaleDateString("ar-EG")}</p>
      </div>

      <section className="rounded-2xl border p-4"><h2 className="mb-2 text-xl font-semibold">ملخص الصفقة</h2><p>{offererName} هيبدّل {offered.title} مقابل {requested.title} مع {requesterName}.</p></section>

      <section id="messages" className="space-y-4 rounded-2xl border p-4">
        <h2 className="text-xl font-semibold">رسائل التنسيق</h2>
        <p className="text-sm text-stone-700">استخدم الرسائل للاتفاق على التفاصيل بهدوء. بلاش تبعت بيانات حساسة بدري.</p>
        {query.message === "sent" ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-sm text-emerald-800">تم إرسال الرسالة.</p> : null}
        {query.messageError ? <p className="rounded-lg border border-rose-200 bg-rose-50 p-2 text-sm text-rose-800">{messageErrorMap[query.messageError] ?? messageErrorMap.send_failed}</p> : null}
        <DealMessageThread messages={messages} currentUserId={user.id} />
        {canSendMessage ? (
          <DealMessageForm dealId={deal.id} />
        ) : (
          <p className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-sm text-stone-700">الرسائل اتقفلت لأن حالة الصفقة اتغيرت.</p>
        )}
        {otherParticipantProfile?.display_name || otherParticipantProfile?.username ? (
          <p className="text-xs text-stone-500">بتنسّق حاليًا مع {otherParticipantProfile.display_name ?? otherParticipantProfile.username}.</p>
        ) : null}
      </section>

      {(deal.status === "coordinating" || deal.status === "completed_pending_confirmation") ? (
        <section className="rounded-2xl border p-4">
          <h2 className="mb-2 text-xl font-semibold">تأكيد إتمام المقايضة</h2>
          <p className="text-sm text-stone-700">أكد بس لما تكون استلمت الحاجة واتأكدت إنها زي الوصف.</p>
          <div className="mt-3 space-y-1 text-sm">
            <p>أنت: {iConfirmed ? "✅ أكدت" : "⏳ لسه"}</p>
            <p>الطرف التاني: {otherConfirmed ? "✅ أكد" : "⏳ لسه"}</p>
          </div>
          {!iConfirmed ? (
            <form action={confirmDealCompleted} className="mt-3">
              <input type="hidden" name="dealId" value={deal.id} />
              <button className="rounded-lg bg-emerald-700 px-4 py-2 text-sm text-white">أكد إن المقايضة تمت</button>
            </form>
          ) : (
            <p className="mt-3 text-sm text-emerald-800">أنت أكدت. مستنيين الطرف التاني.</p>
          )}
        </section>
      ) : null}

      {deal.status === "completed" ? (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="font-semibold text-emerald-900">المقايضة تمت بنجاح.</p>
        </section>
      ) : null}

      {deal.status === "completed" ? (
        <section className="rounded-2xl border p-4">
          <h2 className="mb-2 text-xl font-semibold">قيّم التجربة</h2>
          <p className="text-sm text-stone-700">التقييم بيظهر في بروفايل الطرف التاني بعد الصفقة.</p>
          {myReview ? (
            <p className="mt-3 text-sm text-emerald-800">أنت قيّمت الطرف التاني.</p>
          ) : (
            <form action={submitDealReview} className="mt-3 space-y-3">
              <input type="hidden" name="dealId" value={deal.id} />
              <label className="block text-sm">التقييم
                <select name="rating" className="mt-1 w-full rounded-lg border p-2" defaultValue="5" required>
                  {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} / 5</option>)}
                </select>
              </label>
              <label className="block text-sm">تعليق (اختياري)
                <textarea name="comment" maxLength={300} className="mt-1 w-full rounded-lg border p-2" rows={4} />
              </label>
              <button className="rounded-lg bg-clay px-4 py-2 text-sm text-white">ابعت التقييم</button>
            </form>
          )}
        </section>
      ) : null}

      <div className="flex flex-wrap gap-3"><Link href={`/offers/${deal.offer_id}`} className="rounded-xl border px-4 py-2">افتح العرض الأصلي</Link><Link href={`/items/${offered.id}`} className="rounded-xl border px-4 py-2">افتح الحاجة المعروضة</Link><Link href={`/items/${requested.id}`} className="rounded-xl border px-4 py-2">افتح الحاجة المطلوبة</Link><Link href="/offers/new" className="rounded-xl bg-clay px-4 py-2 text-white">ارجع للعروض</Link></div>
      <Link href={`/report?dealId=${deal.id}&returnTo=${encodeURIComponent(`/deals/${deal.id}`)}`} className="inline-block text-sm text-stone-600 hover:underline">بلّغ عن الصفقة</Link>
    </section>
  );
}
