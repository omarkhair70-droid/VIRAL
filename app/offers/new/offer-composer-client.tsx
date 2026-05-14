"use client";

import { useMemo, useState } from "react";
import { AppIcon } from "@/components/ui/app-icon";
import { Button } from "@/components/ui/button";
import { Field, FormSection, HelperText, Label, Select, Textarea, TextInput } from "@/components/ui/form";
import { MediaFrame, MediaUploadBlock } from "@/components/ui/product-primitives";
import { HighlightPanel, InlineNotice, SoftPanel, SurfaceCard } from "@/components/ui/surfaces";
import { TESWA_CONDITION_LANGUAGE, TESWA_DESIRE_MODE_LANGUAGE } from "@/lib/teswa-product-language";

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
      <h3 className="text-lg font-semibold">إنت هتجاوب على السؤال بإيه؟</h3>
      <p className="text-sm text-app-text-secondary">اختار حاجة موجودة عندك، أو جهّز حاجة جديدة كاقتراح مباشر.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {[["existing_item", "اختار حاجة من حاجاتك", "استخدم حاجة فتحت لها باب قبل كده، لو شايفها مناسبة."] as const, ["new_item", "حضّر حاجة جديدة لهذا الاقتراح", "ضيف حاجة جديدة وخلّيها تكون إجابتك على سؤال القيمة."] as const].map(([value, title, desc]) => <button key={value} type="button" onClick={() => setMode(value)} className={`rounded-surface border p-4 text-right transition ${mode === value ? "border-clay bg-app-accent-soft" : "border-app-border bg-app-surface"}`}><p className="font-semibold">{title}</p><p className="mt-1 text-xs text-app-text-muted">{desc}</p></button>)}
      </div>
    </SurfaceCard>

    <SurfaceCard className={`space-y-3 ${mode === "existing_item" ? "" : "hidden"}`}><h3 className="text-lg font-semibold">اختار الإجابة من حاجاتك</h3>
      {ownItems.length === 0 ? <InlineNotice tone="warning">لسه ماعندكش حاجات جاهزة للاقتراح. استخدم وضع &quot;حضّر حاجة جديدة لهذا الاقتراح&quot;.</InlineNotice> : ownItems.map((item) => <label key={item.id} className={`grid cursor-pointer grid-cols-[auto_84px_1fr] items-center gap-3 rounded-surface-compact border p-3 ${offeredItemId === item.id ? "border-clay bg-app-accent-soft" : "border-app-border"}`}><input checked={offeredItemId === item.id} onChange={() => setOfferedItemId(item.id)} type="radio" name="offered_item_id" value={item.id} className="size-4" /><MediaFrame src={item.imageUrl} alt={item.title} ratio="square" /><div><p className="font-semibold">{item.title}</p><p className="text-xs text-app-text-muted">{item.category ?? "بدون تصنيف"} · {item.conditionLabel}</p></div></label>)}
      {selectedItem ? <SoftPanel><p className="text-xs text-app-text-muted">دي إجابتك الحالية</p><p className="font-semibold">{selectedItem.title}</p></SoftPanel> : null}
    </SurfaceCard>

    <SurfaceCard className={`space-y-4 ${mode === "new_item" ? "" : "hidden"}`}><h3 className="text-lg font-semibold">حضّر حاجة جديدة لهذا الاقتراح</h3>
      <FormSection>
        <Field><Label htmlFor="title">اسم الحاجة</Label><TextInput id="title" name="title" placeholder="مثال: مكتب خشب زان" /></Field>
        <Field><Label htmlFor="category_id">أقرب تصنيف</Label><Select id="category_id" name="category_id" defaultValue=""><option value="">اختار تصنيف</option>{categories.map((c) => <option value={c.id} key={c.id}>{c.name_ar}</option>)}</Select></Field>
        <MediaUploadBlock title="صورة الحاجة" helperText="JPG/PNG/WEBP أقل من 5MB."><label className="block"><input id="image_file" name="image_file" type="file" accept="image/jpeg,image/png,image/webp" required={mode === "new_item"} onChange={(event) => { const selectedFile = event.target.files?.[0] ?? null; setImagePreviewUrl(selectedFile ? URL.createObjectURL(selectedFile) : null); }} className="w-full rounded-field border border-app-border px-3 py-2 text-sm" /></label>{imagePreviewUrl ? <MediaFrame src={imagePreviewUrl} alt="معاينة الصورة" ratio="wide" /> : null}</MediaUploadBlock>
        <Field><Label htmlFor="description" optional>تفاصيل عملية تفيد صاحب الحاجة</Label><Textarea id="description" name="description" placeholder="وصف مختصر يوضح حالتها واستخدامها" /></Field>

        <Field><Label>اللي لازم يتعرف عن حالتها</Label><div className="grid gap-2">{Object.entries(TESWA_CONDITION_LANGUAGE).map(([value, meta]) => <label key={value} className="cursor-pointer rounded-xl border border-app-border p-3"><input type="radio" name="condition" value={value} defaultChecked={value === "good_used"} className="ml-2" /> <span className="font-semibold">{meta.label}</span><p className="mt-1 text-xs text-app-text-muted">{meta.helper}</p></label>)}</div></Field>

        <Field><Label htmlFor="condition_notes" optional>ملاحظة لازم تبقى واضحة</Label><Textarea id="condition_notes" name="condition_notes" placeholder="اذكر أي تفاصيل مهمة عن الحالة" /></Field>
        <div className="grid gap-3 sm:grid-cols-2"><Field><Label htmlFor="city" optional>المدينة</Label><TextInput id="city" name="city" placeholder="القاهرة" /></Field><Field><Label htmlFor="area" optional>المنطقة</Label><TextInput id="area" name="area" placeholder="مدينة نصر" /></Field></div>

        <Field><Label>لو اتنشرت لاحقًا، فاتح بابها لإيه؟</Label><div className="grid gap-2">{Object.entries(TESWA_DESIRE_MODE_LANGUAGE).map(([value, meta]) => <label key={value} className="cursor-pointer rounded-xl border border-app-border p-3"><input type="radio" name="desire_mode" value={value} defaultChecked={value === "flexible"} className="ml-2" /> <span className="font-semibold">{meta.label}</span><p className="mt-1 text-xs text-app-text-muted">{meta.helper}</p></label>)}</div></Field>

        <Field><Label htmlFor="desire_text" optional>لو اتنشرت لاحقًا، فاتح بابها لإيه؟</Label><Textarea id="desire_text" name="desire_text" placeholder="اكتب أمثلة تساعد الطرف التاني يفهم تفضيلاتك" /></Field>
        <Field><Label htmlFor="wanted_tags" optional>كلمات مفتاحية</Label><TextInput id="wanted_tags" name="wanted_tags" placeholder="مثال: مكتب, ديكور" /></Field>
      </FormSection>
    </SurfaceCard>

    <HighlightPanel className="space-y-2"><h3 className="text-lg font-semibold">افهم الباب المفتوح قبل ما تقترح</h3><p className="text-sm">{requestedItem.desireText ? `صاحب الحاجة موضح الباب اللي فاتحه: ${requestedItem.desireText}` : "مافيش توضيح مكتوب. خلي رسالتك تشرح ليه اقتراحك ممكن يبقى مناسب."}</p></HighlightPanel>

    <SurfaceCard className="space-y-2"><h3 className="text-lg font-semibold">اشرح قراءتك للقيمة</h3><Field><Label htmlFor="message" optional>رسالة قصيرة لصاحب الحاجة</Label><Textarea id="message" name="message" placeholder="أنا شايف المقايضة دي مناسبة لأن…" /><HelperText>مش مطلوب كلام طويل. جملة صادقة قد تفرق.</HelperText></Field></SurfaceCard>

    <HighlightPanel className="space-y-3"><h3 className="flex items-center gap-2 text-lg font-semibold"><AppIcon name="swap" className="size-4 text-clay" />راجع اقتراحك قبل ما يوصل</h3><p className="text-sm text-app-text-secondary">دي إجابتك على سؤال القيمة، وصاحب الحاجة هيشوفها بالشكل ده.</p><div className="grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center"><SoftPanel><p className="text-xs text-app-text-muted">اللي شايفه مناسب عندي</p><p className="font-semibold">{mode === "existing_item" ? (selectedItem?.title ?? "اختار حاجة من قائمتك") : "حاجة جديدة حسب البيانات اللي فوق"}</p></SoftPanel><div className="text-center text-2xl text-clay">↔</div><SoftPanel><p className="text-xs text-app-text-muted">الحاجة اللي شدتني</p><p className="font-semibold">{requestedItem.title}</p></SoftPanel></div></HighlightPanel>

    <div className="space-y-2 pt-1"><Button type="submit" size="lg" fullWidth>ابعت اقتراحك</Button>{hasSourceOffer ? <InlineNotice tone="accent">تذكير: الاقتراح التاني لازم يكون بحاجة مختلفة عن الأولى.</InlineNotice> : null}</div>
  </div>;
}
