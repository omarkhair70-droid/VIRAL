"use client";

import { useMemo, useState } from "react";
import { AppIcon } from "@/components/ui/app-icon";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type OwnItem = {
  id: string;
  title: string;
  conditionLabel: string;
  category: string | null;
  imageUrl: string | null;
};

type RequestedItem = {
  id: string;
  title: string;
  conditionLabel: string;
  category: string | null;
  ownerName: string;
  imageUrl: string | null;
  desireText: string | null;
};

export function OfferComposerClient({ requestedItem, ownItems, categories, hasSourceOffer }: { requestedItem: RequestedItem; ownItems: OwnItem[]; categories: Array<{ id: string; name_ar: string }>; hasSourceOffer: boolean }) {
  const [mode, setMode] = useState<"existing_item" | "new_item">("existing_item");
  const [offeredItemId, setOfferedItemId] = useState(ownItems[0]?.id ?? "");
  const selectedItem = useMemo(() => ownItems.find((item) => item.id === offeredItemId) ?? null, [ownItems, offeredItemId]);

  return (
    <div className="space-y-5">
      <input type="hidden" name="offer_mode" value={mode} />
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">اختار طريقة العرض</CardTitle>
          <CardDescription>حدّد إذا كنت هتستخدم حاجة منشورة بالفعل أو تضيف حاجة جديدة بسرعة.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={() => setMode("existing_item")} className={`rounded-xl border p-3 text-right transition ${mode === "existing_item" ? "border-clay bg-sand" : "border-warmBorder bg-white"}`}>
            <p className="font-semibold">اختار من حاجاتك</p>
            <p className="text-sm text-muted">اختار حاجة أنت عارضها بالفعل.</p>
          </button>
          <button type="button" onClick={() => setMode("new_item")} className={`rounded-xl border p-3 text-right transition ${mode === "new_item" ? "border-clay bg-sand" : "border-warmBorder bg-white"}`}>
            <p className="font-semibold">نزّل حاجة جديدة كعرض</p>
            <p className="text-sm text-muted">هتنشر حاجة جديدة وتتبعت فورًا كعرض.</p>
          </button>
        </CardContent>
      </Card>

      <Card className={mode === "existing_item" ? "" : "hidden"}>
        <CardHeader>
          <CardTitle className="text-lg">اختيار الحاجة المعروضة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {ownItems.length === 0 ? <Alert>لسه ماعندكش حاجات نشطة. اختار وضع &quot;نزّل حاجة جديدة كعرض&quot;.</Alert> : null}
          {ownItems.map((item) => (
            <label key={item.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${offeredItemId === item.id ? "border-clay bg-sand" : "border-warmBorder"}`}>
              <input checked={offeredItemId === item.id} onChange={() => setOfferedItemId(item.id)} type="radio" name="offered_item_id" value={item.id} className="size-4" />
              {item.imageUrl ? <img src={item.imageUrl} alt={item.title} className="size-16 rounded-lg object-cover" /> : <div className="size-16 rounded-lg bg-stone-100" />}
              <div className="min-w-0">
                <p className="truncate font-semibold">{item.title}</p>
                <p className="text-xs text-muted">{item.category ?? "بدون تصنيف"} · {item.conditionLabel}</p>
              </div>
            </label>
          ))}
        </CardContent>
      </Card>

      <Card className={mode === "new_item" ? "" : "hidden"}>
        <CardHeader>
          <CardTitle className="text-lg">نزّل حاجة جديدة كعرض</CardTitle>
          <CardDescription>الحاجة اللي هتنزلها هنا هتبقى إعلان ظاهر في السوق كمان.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <input name="title" placeholder="عنوان الحاجة" className="w-full rounded-xl border px-3 py-2" />
            <select name="category_id" className="w-full rounded-xl border px-3 py-2"><option value="">اختار تصنيف</option>{categories.map((c) => <option value={c.id} key={c.id}>{c.name_ar}</option>)}</select>
            <input name="image_url" type="url" placeholder="رابط الصورة" className="w-full rounded-xl border px-3 py-2" />
            <textarea name="description" placeholder="وصف" className="w-full rounded-xl border px-3 py-2" />
            <select name="condition" defaultValue="good_used" className="w-full rounded-xl border px-3 py-2"><option value="almost_new">جديد تقريبًا</option><option value="good_used">مستخدم بحالة كويسة</option><option value="minor_issues">فيه عيوب بسيطة</option><option value="needs_repair">محتاج تصليح / عارف حالته</option></select>
            <textarea name="condition_notes" placeholder="ملاحظات الحالة" className="w-full rounded-xl border px-3 py-2" />
            <div className="grid gap-2 sm:grid-cols-2"><input name="city" placeholder="المدينة" className="rounded-xl border px-3 py-2" /><input name="area" placeholder="المنطقة" className="rounded-xl border px-3 py-2" /></div>
            <select name="desire_mode" defaultValue="flexible" className="w-full rounded-xl border px-3 py-2"><option value="specific">بدور على حاجة معينة</option><option value="flexible">عندي حاجات في بالي، بس فاجئني</option><option value="surprise">فاجئني تمامًا</option></select>
            <textarea name="desire_text" placeholder="عايز إيه" className="w-full rounded-xl border px-3 py-2" />
            <input name="wanted_tags" placeholder="مثال: مكتب, ديكور" className="w-full rounded-xl border px-3 py-2" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">خلي عرضك مفهوم</CardTitle>
          <CardDescription>{requestedItem.desireText ? `صاحب الحاجة كاتب إنه بيدور على: ${requestedItem.desireText}` : "لو مفيش رغبة مكتوبة، وضّح في الرسالة ليه العرض مناسب."}</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">رسالة توضح العرض (اختياري)</CardTitle>
          <CardDescription>رسالة قصيرة وواضحة تزود فرصة الرد.</CardDescription>
        </CardHeader>
        <CardContent>
          <textarea name="message" placeholder="الحاجة دي مناسبة لأن..." className="w-full rounded-xl border px-3 py-2" />
          <p className="text-xs text-muted">أمثلة: &quot;الحاجة دي مناسبة لأن...&quot; / &quot;أقدر أبدّلها بالحاجة دي لأنها...&quot;</p>
        </CardContent>
      </Card>

      <Card className="border-clay/30 bg-sand/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><AppIcon name="swap" className="size-4 text-clay" />دي الصفقة اللي هتبعتها</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <div className="rounded-xl border bg-white p-3"><p className="text-xs text-muted">اللي هتعرضه</p><p className="font-semibold">{mode === "existing_item" ? (selectedItem?.title ?? "اختار حاجة من قائمتك") : "حاجة جديدة (حسب البيانات اللي فوق)"}</p></div>
          <div className="text-center text-2xl text-clay">↔</div>
          <div className="rounded-xl border bg-white p-3"><p className="text-xs text-muted">اللي عايز تاخده</p><p className="font-semibold">{requestedItem.title}</p></div>
        </CardContent>
      </Card>

      <div className="pt-2"><Button type="submit" size="lg">ابعت العرض</Button></div>
      {hasSourceOffer ? <p className="text-xs text-muted">تذكير: لازم العرض التاني يكون بحاجة مختلفة عن العرض الأصلي.</p> : null}
    </div>
  );
}
