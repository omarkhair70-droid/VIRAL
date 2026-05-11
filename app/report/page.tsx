import Link from "next/link";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { normalizeNextPath } from "@/lib/normalize-next-path";
import { createReport } from "./actions";

const reasonOptions = [
  { value: "misleading_item", label: "إعلان مضلل" },
  { value: "inappropriate_content", label: "محتوى غير مناسب" },
  { value: "spam_offer", label: "عرض مزعج / سبام" },
  { value: "unsafe_behavior", label: "تصرف غير آمن" },
  { value: "no_show", label: "عدم حضور أو اتفاق فشل" },
  { value: "other", label: "سبب آخر" },
] as const;

const errorMap: Record<string, string> = {
  missing_target: "اختار حاجة تبلغ عنها.",
  invalid_reason: "اختار سبب البلاغ.",
  submit_failed: "مش قادرين نبعت البلاغ دلوقتي. جرّب تاني.",
  not_allowed: "مش مسموح تعمل البلاغ ده.",
};

export default async function ReportPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const query = (await searchParams) ?? {};
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const itemId = typeof query.itemId === "string" ? query.itemId : "";
  const offerId = typeof query.offerId === "string" ? query.offerId : "";
  const dealId = typeof query.dealId === "string" ? query.dealId : "";
  const userIdFromQuery = typeof query.userId === "string" ? query.userId : "";
  const username = typeof query.username === "string" ? query.username : "";
  const rawReturnTo = typeof query.returnTo === "string" ? query.returnTo : "";
  const returnTo = normalizeNextPath(rawReturnTo, "/safety");

  const nextPath = `/report?${new URLSearchParams(Object.entries({ itemId, offerId, dealId, userId: userIdFromQuery, username, returnTo }).filter(([, value]) => Boolean(value))).toString()}`;
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);

  let resolvedUserId = userIdFromQuery;
  if (!resolvedUserId && username) {
    const { data: profile } = await supabase.from("profiles").select("id").eq("username", username.toLowerCase()).maybeSingle();
    resolvedUserId = profile?.id ?? "";
  }

  const targets = [itemId, offerId, dealId, resolvedUserId].filter(Boolean);
  if (targets.length !== 1) redirect(`/safety?error=missing_target`);

  const errorCode = typeof query.error === "string" ? query.error : "";

  return (
    <section className="mx-auto max-w-2xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-3xl font-bold">بلّغ عن حاجة مش مريحة</h1>
        <p className="mt-2 text-stone-600">البلاغات بتساعدنا نحافظ على التجربة آمنة ومحترمة. اكتب اللي حصل بوضوح من غير بيانات خاصة.</p>
      </div>

      {errorCode && errorMap[errorCode] ? <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-800">{errorMap[errorCode]}</p> : null}

      <form action={createReport} className="space-y-4 rounded-2xl border bg-white p-5">
        <input type="hidden" name="item_id" value={itemId} />
        <input type="hidden" name="offer_id" value={offerId} />
        <input type="hidden" name="deal_id" value={dealId} />
        <input type="hidden" name="reported_user_id" value={resolvedUserId} />
        <input type="hidden" name="returnTo" value={returnTo} />

        <label className="block text-sm font-medium">سبب البلاغ
          <select name="reason" defaultValue="" required className="mt-1 w-full rounded-lg border p-2 text-sm">
            <option value="" disabled>اختار السبب</option>
            {reasonOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>

        <label className="block text-sm font-medium">تفاصيل إضافية (اختياري)
          <textarea name="details" maxLength={500} rows={5} className="mt-1 w-full rounded-lg border p-2 text-sm" />
          <span className="mt-1 block text-xs text-stone-500">اكتب تفاصيل بسيطة تساعدنا نفهم المشكلة. بلاش تكتب رقم موبايل أو عنوان خاص.</span>
        </label>

        <div className="flex items-center gap-3">
          <button className="rounded-xl bg-clay px-4 py-2 text-white">ابعت البلاغ</button>
          <Link href={returnTo as Route} className="text-sm text-stone-600 hover:underline">ارجع</Link>
        </div>
      </form>
    </section>
  );
}
