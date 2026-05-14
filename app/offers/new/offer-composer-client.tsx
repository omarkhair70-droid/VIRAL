"use client";

import { useMemo, useState } from "react";
import { AppIcon } from "@/components/ui/app-icon";
import { Button } from "@/components/ui/button";
import { Field, FormSection, HelperText, Label, Select, Textarea, TextInput } from "@/components/ui/form";
import { MediaFrame, MediaUploadBlock } from "@/components/ui/product-primitives";
import { HighlightPanel, InlineNotice, SoftPanel, SurfaceCard } from "@/components/ui/surfaces";

type OwnItem = { id: string; title: string; conditionLabel: string; category: string | null; imageUrl: string | null };
type RequestedItem = { id: string; title: string; conditionLabel: string; category: string | null; ownerName: string; imageUrl: string | null; desireText: string | null };

export function OfferComposerClient({ requestedItem, ownItems, categories, hasSourceOffer }: { requestedItem: RequestedItem; ownItems: OwnItem[]; categories: Array<{ id: string; name_ar: string }>; hasSourceOffer: boolean }) {
  const [mode, setMode] = useState<"existing_item" | "new_item">("existing_item");
  const [offeredItemId, setOfferedItemId] = useState(ownItems[0]?.id ?? "");
  const selectedItem = useMemo(() => ownItems.find((item) => item.id === offeredItemId) ?? null, [ownItems, offeredItemId]);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  return <div className="space-y-4">
    <input type="hidden" name="offer_mode" value={mode} />

    <SurfaceCard className="space-y-3">
      <h3 className="text-lg font-semibold">اختار طريقة العرض</h3>
      <p className="text-sm text-app-text-secondary">حدّد إذا كنت هتستخدم حاجة منشورة بالفعل أو تنزّل حاجة جديدة كعرض مباشر.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {[["existing_item", "اختار من حاجاتك", "اختيار سريع من الحاجات النشطة."] as const, ["new_item", "نزّل حاجة جديدة كعرض", "تنشر حاجة جديدة وتتبعِت فورًا كعرض."] as const].map(([value, title, desc]) => <button key={value} type="button" onClick={() => setMode(value)} className={`rounded-surface border p-4 text-right transition ${mode === value ? "border-clay bg-app-accent-soft" : "border-app-border bg-app-surface"}`}><p className="font-semibold">{title}</p><p className="mt-1 text-xs text-app-text-muted">{desc}</p></button>)}
      </div>
    </SurfaceCard>

    {mode === "existing_item" ? <SurfaceCard className="space-y-3"><h3 className="text-lg font-semibold">جهّز الحاجة اللي هتقدّمها</h3>
      {ownItems.length === 0 ? <InlineNotice tone="warning">لسه ماعندكش حاجات نشطة. اختار وضع &quot;نزّل حاجة جديدة كعرض&quot;.</InlineNotice> : ownItems.map((item) => <label key={item.id} className={`grid cursor-pointer grid-cols-[auto_84px_1fr] items-center gap-3 rounded-surface-compact border p-3 ${offeredItemId === item.id ? "border-clay bg-app-accent-soft" : "border-app-border"}`}><input checked={offeredItemId === item.id} onChange={() => setOfferedItemId(item.id)} type="radio" name="offered_item_id" value={item.id} className="size-4" /><MediaFrame src={item.imageUrl} alt={item.title} ratio="square" /><div><p className="font-semibold">{item.title}</p><p className="text-xs text-app-text-muted">{item.category ?? "بدون تصنيف"} · {item.conditionLabel}</p></div></label>)}
      {selectedItem ? <SoftPanel><p className="text-xs text-app-text-muted">اختيارك الحالي</p><p className="font-semibold">{selectedItem.title}</p></SoftPanel> : null}
    </SurfaceCard> : null}

    {mode === "new_item" ? <SurfaceCard className="space-y-4"><h3 className="text-lg font-semibold">جهّز الحاجة الجديدة كعرض</h3>
      <FormSection>
        <Field><Label htmlFor="title">عنوان الحاجة</Label><TextInput id="title" name="title" placeholder="مثال: مكتب خشب زان" /></Field>
        <Field><Label htmlFor="category_id">التصنيف</Label><Select id="category_id" name="category_id" defaultValue=""><option value="">اختار تصنيف</option>{categories.map((c) => <option value={c.id} key={c.id}>{c.name_ar}</option>)}</Select></Field>
        <MediaUploadBlock title="صورة الحاجة" helperText="JPG/PNG/WEBP أقل من 5MB."><label className="block"><input id="image_file" name="image_file" type="file" accept="image/jpeg,image/png,image/webp" required={mode === "new_item"} onChange={(event) => { const selectedFile = event.target.files?.[0] ?? null; setImagePreviewUrl(selectedFile ? URL.createObjectURL(selectedFile) : null); }} className="w-full rounded-field border border-app-border px-3 py-2 text-sm" /></label>{imagePreviewUrl ? <MediaFrame src={imagePreviewUrl} alt="معاينة الصورة" ratio="wide" /> : null}</MediaUploadBlock>
        <Field><Label htmlFor="description" optional>وصف الحاجة</Label><Textarea id="description" name="description" placeholder="وصف مختصر يوضح حالتها واستخدامها" /></Field>
        <Field><Label htmlFor="condition">حالة الحاجة</Label><Select id="condition" name="condition" defaultValue="good_used"><option value="almost_new">جديد تقريبًا</option><option value="good_used">مستخدم بحالة كويسة</option><option value="minor_issues">فيه عيوب بسيطة</option><option value="needs_repair">محتاج تصليح / عارف حالته</option></Select></Field>
        <Field><Label htmlFor="condition_notes" optional>ملاحظات الحالة</Label><Textarea id="condition_notes" name="condition_notes" placeholder="اذكر أي تفاصيل مهمة عن الحالة" /></Field>
        <div className="grid gap-3 sm:grid-cols-2"><Field><Label htmlFor="city" optional>المدينة</Label><TextInput id="city" name="city" placeholder="القاهرة" /></Field><Field><Label htmlFor="area" optional>المنطقة</Label><TextInput id="area" name="area" placeholder="مدينة نصر" /></Field></div>
        <Field><Label htmlFor="desire_mode">بتدور على إيه؟</Label><Select id="desire_mode" name="desire_mode" defaultValue="flexible"><option value="specific">بدور على حاجة معينة</option><option value="flexible">عندي حاجات في بالي، بس فاجئني</option><option value="surprise">فاجئني تمامًا</option></Select></Field>
        <Field><Label htmlFor="desire_text" optional>تفاصيل اللي محتاجه</Label><Textarea id="desire_text" name="desire_text" placeholder="اكتب أمثلة تساعد الطرف التاني يفهم تفضيلاتك" /></Field>
        <Field><Label htmlFor="wanted_tags" optional>كلمات مفتاحية</Label><TextInput id="wanted_tags" name="wanted_tags" placeholder="مثال: مكتب, ديكور" /></Field>
      </FormSection>
    </SurfaceCard> : null}

    <HighlightPanel className="space-y-2"><h3 className="text-lg font-semibold">خلي عرضك أقرب للي صاحب الحاجة مستنيه</h3><p className="text-sm">{requestedItem.desireText ? `صاحب الحاجة موضح إنه بيدوّر على: ${requestedItem.desireText}` : "مفيش رغبة مكتوبة، فركّز في الرسالة على الفايدة والحالة والتبادل المتوقع."}</p></HighlightPanel>

    <SurfaceCard className="space-y-2"><h3 className="text-lg font-semibold">وضّح ليه عرضك مناسب</h3><Field><Label htmlFor="message" optional>رسالة قصيرة وواضحة</Label><Textarea id="message" name="message" placeholder="الحاجة دي مناسبة ليك لأن..." /><HelperText>مثال: &quot;مناسب لاستخدامك لأن...&quot; / &quot;أقدر أبدّل فورًا لأن...&quot;</HelperText></Field></SurfaceCard>

    <HighlightPanel className="space-y-3"><h3 className="flex items-center gap-2 text-lg font-semibold"><AppIcon name="swap" className="size-4 text-clay" />راجع الصفقة قبل الإرسال</h3><p className="text-sm text-app-text-secondary">دي الصفقة اللي هتتبعت دلوقتي.</p><div className="grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center"><SoftPanel><p className="text-xs text-app-text-muted">اللي هتعرضه</p><p className="font-semibold">{mode === "existing_item" ? (selectedItem?.title ?? "اختار حاجة من قائمتك") : "حاجة جديدة حسب البيانات اللي فوق"}</p></SoftPanel><div className="text-center text-2xl text-clay">↔</div><SoftPanel><p className="text-xs text-app-text-muted">اللي عايز تاخده</p><p className="font-semibold">{requestedItem.title}</p></SoftPanel></div></HighlightPanel>

    <div className="space-y-2 pt-1"><Button type="submit" size="lg" fullWidth>ابعت العرض</Button>{hasSourceOffer ? <InlineNotice tone="accent">تذكير: لازم العرض التاني يكون بحاجة مختلفة عن العرض الأصلي.</InlineNotice> : null}</div>
  </div>;
}
