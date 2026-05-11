import Link from "next/link";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { normalizeNextPath } from "@/lib/normalize-next-path";
import { createReport } from "./actions";

const defaultReasonOptions = [
  { value: "misleading_item", label: "إعلان مضلل" },
  { value: "inappropriate_content", label: "محتوى غير مناسب" },
  { value: "spam_offer", label: "عرض مزعج / سبام" },
  { value: "unsafe_behavior", label: "تصرف غير آمن" },
  { value: "no_show", label: "عدم حضور أو اتفاق فشل" },
  { value: "other", label: "سبب آخر" },
] as const;

const messageReasonOptions = [
  { value: "inappropriate_content", label: "محتوى غير مناسب" },
  { value: "spam_offer", label: "إزعاج / سبام" },
  { value: "unsafe_behavior", label: "تصرف غير آمن" },
  { value: "other", label: "سبب آخر" },
] as const;

const errorMap: Record<string, string> = {
  missing_target: "اختار حاجة تبلغ عنها.",
  invalid_reason: "اختار سبب البلاغ.",
  submit_failed: "مش قادرين نبعت البلاغ دلوقتي. جرّب تاني.",
  not_allowed: "مش مسموح تعمل البلاغ ده.",
  own_message: "مش محتاج تبلغ عن رسالتك أنت.",
  invalid_message: "الرسالة دي مش متاحة للبلاغ.",
};

export default async function ReportPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const query = (await searchParams) ?? {};
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const itemId = typeof query.itemId === "string" ? query.itemId : "";
  const offerId = typeof query.offerId === "string" ? query.offerId : "";
  const dealId = typeof query.dealId === "string" ? query.dealId : "";
  const messageId = typeof query.messageId === "string" ? query.messageId : "";
  const userIdFromQuery = typeof query.userId === "string" ? query.userId : "";
  const username = typeof query.username === "string" ? query.username : "";
  const rawReturnTo = typeof query.returnTo === "string" ? query.returnTo : "";
  const returnTo = normalizeNextPath(rawReturnTo, "/safety");

  const nextPath = `/report?${new URLSearchParams(Object.entries({ itemId, offerId, dealId, messageId, userId: userIdFromQuery, username, returnTo }).filter(([, value]) => Boolean(value))).toString()}`;
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);

  let resolvedUserId = userIdFromQuery;
  if (!resolvedUserId && username) {
    const { data: profile } = await supabase.from("profiles").select("id").eq("username", username.toLowerCase()).maybeSingle();
    resolvedUserId = profile?.id ?? "";
  }

  let messagePreview = "";
  if (messageId) {
    const { data: message } = await supabase
      .from("deal_messages")
      .select("id,deal_id,sender_id,body,created_at,swap_deals!inner(requester_id,offerer_id)")
      .eq("id", messageId)
      .maybeSingle();
    const deal = Array.isArray(message?.swap_deals) ? message.swap_deals[0] : message?.swap_deals;
    const isParticipant = !!deal && (deal.requester_id === user.id || deal.offerer_id === user.id);
    if (!message || !deal || !isParticipant || message.sender_id === user.id) {
      redirect(`/safety?error=not_allowed`);
    }
    messagePreview = message.body.slice(0, 120);
  }

  const targets = [itemId, offerId, dealId, resolvedUserId, messageId].filter(Boolean);
  if (targets.length !== 1) redirect(`/safety?error=missing_target`);

  const errorCode = typeof query.error === "string" ? query.error : "";
  const reasons = messageId ? messageReasonOptions : defaultReasonOptions;

  return (
    <section className="mx-auto max-w-2xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-3xl font-bold">بلّغ عن حاجة مش مريحة</h1>
        <p className="mt-2 text-stone-600">البلاغات بتساعدنا نحافظ على التجربة آمنة ومحترمة. اكتب اللي حصل بوضوح من غير بيانات خاصة.</p>
      </div>

      {messageId ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <p className="font-semibold">بلاغ عن رسالة في الصفقة</p>
          {messagePreview ? <p className="mt-1">{messagePreview}</p> : null}
        </div>
      ) : null}

      {errorCode && errorMap[errorCode] ? <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-800">{errorMap[errorCode]}</p> : null}

      <form action={createReport} className="space-y-4 rounded-2xl border bg-white p-5">
        <input type="hidden" name="item_id" value={itemId} />
        <input type="hidden" name="offer_id" value={offerId} />
        <input type="hidden" name="deal_id" value={dealId} />
        <input type="hidden" name="reported_user_id" value={resolvedUserId} />
        <input type="hidden" name="deal_message_id" value={messageId} />
        <input type="hidden" name="returnTo" value={returnTo} />

        <label className="block text-sm font-medium">سبب البلاغ
          <select name="reason" defaultValue="" required className="mt-1 w-full rounded-lg border p-2 text-sm">
            <option value="" disabled>اختار السبب</option>
            {reasons.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>

        <label className="block text-sm font-medium">تفاصيل إضافية (اختياري)
          <textarea name="details" maxLength={500} rows={5} className="mt-1 w-full rounded-lg border p-2 text-sm" />
        </label>

        <div className="flex items-center gap-3">
          <button className="rounded-xl bg-clay px-4 py-2 text-white">ابعت البلاغ</button>
          <Link href={returnTo as Route} className="text-sm text-stone-600 hover:underline">ارجع</Link>
        </div>
      </form>
    </section>
  );
}
