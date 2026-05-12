"use client";

import { useState } from "react";
import { AppIcon } from "@/components/ui/app-icon";
import { acceptOffer, markOfferThinking, redirectOffer, softRejectOffer } from "./actions";

type ResponseMode = "accept" | "thinking" | "soft_reject" | "redirect";

const decisionOptions: Array<{ key: ResponseMode; title: string; hint: string; icon: "check" | "clock" | "warning" | "forward"; tone: "emerald" | "stone" | "sky" }> = [
  { key: "accept", title: "قبول العرض", hint: "تتفتح صفحة تنسيق مباشرة.", icon: "check", tone: "emerald" },
  { key: "thinking", title: "محتاج أفكر", hint: "علّم العرض كمحتاج وقت.", icon: "clock", tone: "stone" },
  { key: "soft_reject", title: "العرض ما ظبطش", hint: "رفض محترم من غير تصعيد.", icon: "warning", tone: "stone" },
  { key: "redirect", title: "افتح باب تاني", hint: "شجّع عرض بديل مرتبط.", icon: "forward", tone: "sky" },
];

const redirectChoices = [
  { value: "offer_another_item", label: "اعرض حاجة تانية" },
  { value: "ask_for_different_item", label: "بدور على نوع مختلف" },
  { value: "update_preferences", label: "وضّحلي اختياراتك أكتر" },
];

export function OfferResponsePanel({ offerId }: { offerId: string }) {
  const [mode, setMode] = useState<ResponseMode | null>(null);

  return (
    <section className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 md:p-5">
      <div>
        <h2 className="text-lg font-semibold">رد على العرض</h2>
        <p className="text-sm text-stone-700">اختار القرار الأول، وبعدها هتظهر لك التفاصيل الخاصة بالرد ده فقط.</p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {decisionOptions.map((option) => {
          const active = mode === option.key;
          return (
            <button
              key={option.key}
              type="button"
              onClick={() => setMode(option.key)}
              className={`rounded-xl border p-3 text-right transition ${active ? "border-clay bg-white shadow-sm" : "border-stone-200 bg-white hover:border-stone-300"}`}
            >
              <p className="flex items-center gap-2 font-semibold text-stone-900"><AppIcon name={option.icon} className={`size-4 ${option.tone === "emerald" ? "text-emerald-700" : option.tone === "sky" ? "text-sky-700" : "text-stone-700"}`} />{option.title}</p>
              <p className="mt-1 text-sm text-stone-600">{option.hint}</p>
            </button>
          );
        })}
      </div>

      {mode === "accept" ? <form action={acceptOffer} className="rounded-xl border bg-white p-3"><input type="hidden" name="offerId" value={offerId} /><p className="font-semibold">قبول العرض</p><p className="text-sm text-stone-600">لما تقبل، الحاجتين هيتحجزوا وتتفتح صفحة تنسيق خاصة بينكم.</p><button className="mt-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white">اقبل العرض</button></form> : null}

      {mode === "thinking" ? <form action={markOfferThinking} className="rounded-xl border bg-white p-3"><input type="hidden" name="offerId" value={offerId} /><p className="font-semibold">محتاج أفكر</p><p className="text-sm text-stone-600">العرض يفضل مفتوح، وصاحب العرض يعرف إنك محتاج وقت قبل القرار.</p><textarea name="note" className="mt-2 w-full rounded-lg border p-2 text-sm" placeholder="شكراً على العرض، بس محتاج أفكر شوية." /><button className="mt-2 rounded-lg border px-3 py-2 text-sm">علّم العرض كمحتاج تفكير</button></form> : null}

      {mode === "soft_reject" ? <form action={softRejectOffer} className="rounded-xl border bg-white p-3"><input type="hidden" name="offerId" value={offerId} /><p className="font-semibold">العرض ما ظبطش</p><p className="text-sm text-stone-600">العرض يتقفل بلطف من غير صفقة. استخدمها لو العرض مش مناسب.</p><p className="mt-2 text-sm">سبب بسيط (اختياري)</p><textarea name="note" className="mt-1 w-full rounded-lg border p-2 text-sm" placeholder="شكراً على العرض، بس مش مناسب ليا دلوقتي." /><button className="mt-2 rounded-lg border px-3 py-2 text-sm">ارفض بلطف</button></form> : null}

      {mode === "redirect" ? <form action={redirectOffer} className="rounded-xl border bg-white p-3"><input type="hidden" name="offerId" value={offerId} /><p className="font-semibold">افتح باب تاني</p><p className="text-sm text-stone-600">العرض ده مش مناسب، بس صاحب العرض يقدر يبعت عرض تاني مختلف مرتبط بنفس الإعلان.</p><select name="redirectType" className="mt-2 w-full rounded-lg border p-2 text-sm" defaultValue=""><option value="" disabled>اختار نوع الباب التاني</option>{redirectChoices.map((choice) => <option key={choice.value} value={choice.value}>{choice.label}</option>)}</select><textarea name="note" className="mt-2 w-full rounded-lg border p-2 text-sm" placeholder="ممكن تبعت حاجة تانية أقرب لاحتياجي." /><button className="mt-2 rounded-lg bg-sky-700 px-3 py-2 text-sm text-white">افتح باب تاني</button></form> : null}
    </section>
  );
}
