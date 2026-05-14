"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CharacterCount, Field, FormActions, HelperText, Label, Select, TextInput, Textarea } from "@/components/ui/form";
import { MediaFrame, MediaUploadBlock, ProcessingState } from "@/components/ui/product-primitives";
import {
  TESWA_CONDITION_LANGUAGE,
  TESWA_DESIRE_MODE_LANGUAGE,
  type TeswaConditionValue,
  type TeswaDesireModeValue,
} from "@/lib/teswa-product-language";

type Category = { id: string; name_ar: string };
type Step = 1 | 2 | 3 | 4 | 5 | 6;

type Props = {
  categories: Category[];
  prefill: string;
  action: (formData: FormData) => Promise<{ ok: true; itemId: string } | { ok: false; error: "validation" | "publish" }>;
  authRequired?: boolean;
  userId: string | null;
  draftItemId: string;
};

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILES = 4;
const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_ITEM_STORY = 600;
const MAX_SWAP_REASON = 240;
const MAX_GOOD_FOR = 240;

const STEP_META: Record<Step, { title: string; purpose: string }> = {
  1: { title: "خلّيها تتشاف", purpose: "الصورة أول باب يخلي حد يوقف عندها." },
  2: { title: "عرّفها ببساطة", purpose: "اسمها ومكانها يساعدوا الناس تفهمها بسرعة." },
  3: { title: "قول الحقيقة من الأول", purpose: "الصدق يخلي العرض ييجي على نور." },
  4: { title: "احكي ليه خرجت من عالمك", purpose: "الحكاية تفرّق بين حاجة عادية واحتمال يشد." },
  5: { title: "افتح باب العروض", purpose: "قول مدى انفتاحك وسيب الناس تقترح." },
  6: { title: "راجع الاحتمال", purpose: "راجعها كأنك واحد بيشوفها لأول مرة." },
};

function makeSafeFilename(fileName: string) { return fileName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9._-]/g, "").replace(/-+/g, "-").slice(0, 120); }

export function ItemForm({ categories, prefill, action, authRequired = false, userId, draftItemId }: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [step, setStep] = useState<Step>(1);
  const [files, setFiles] = useState<File[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStage, setSubmissionStage] = useState<"idle" | "uploading" | "publishing">("idle");
  const [title, setTitle] = useState(prefill);
  const [categoryId, setCategoryId] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [condition, setCondition] = useState<TeswaConditionValue>("good_used");
  const [conditionNotes, setConditionNotes] = useState("");
  const [description, setDescription] = useState("");
  const [itemStory, setItemStory] = useState("");
  const [swapReason, setSwapReason] = useState("");
  const [goodFor, setGoodFor] = useState("");
  const [desireMode, setDesireMode] = useState<TeswaDesireModeValue>("flexible");
  const [desireText, setDesireText] = useState("");
  const [wantedTags, setWantedTags] = useState("");
  const router = useRouter();

  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);

  const validateFiles = (selectedFiles: File[]) => {
    if (selectedFiles.length < 1) return "لازم تختار صورة واحدة على الأقل.";
    if (selectedFiles.length > MAX_FILES) return "مسموح لحد 4 صور.";
    for (const file of selectedFiles) {
      if (!ALLOWED_TYPES.has(file.type)) return "الصورة لازم تكون JPG أو PNG أو WEBP.";
      if (file.size > MAX_SIZE_BYTES) return "كل صورة لازم تكون أقل من 5 ميجا.";
    }
    return null;
  };

  const validateCurrentStep = () => {
    if (step === 1) return validateFiles(files);
    if (step === 2 && !title.trim()) return "اكتب اسم واضح للحاجة.";
    if (step === 2 && categories.length > 0 && !categoryId) return "اختار أقرب تصنيف للحاجة.";
    if (step === 3 && !condition) return "اختار إيه اللي لازم يتعرف بوضوح.";
    if (step === 4 && (itemStory.length > MAX_ITEM_STORY || swapReason.length > MAX_SWAP_REASON || goodFor.length > MAX_GOOD_FOR)) return "فيه حقل قصة متخطّي الحد المسموح.";
    return null;
  };

  const goNext = () => { const e = validateCurrentStep(); if (e) return setErrorMessage(e); setErrorMessage(null); setStep((s) => Math.min(6, s + 1) as Step); };
  const goBack = () => { setErrorMessage(null); setStep((s) => Math.max(1, s - 1) as Step); };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setErrorMessage(null);
    const stepError = validateCurrentStep();
    if (stepError) return setErrorMessage(stepError);
    if (!userId || authRequired) return setErrorMessage("سجّل دخول علشان تفتح للحاجة باب عروض.");

    setIsSubmitting(true); setSubmissionStage("uploading");
    const uploadedPaths: string[] = [];
    try {
      for (const file of files) {
        const objectPath = `items/${userId}/${draftItemId}/${Date.now()}-${makeSafeFilename(file.name || "image")}`;
        const { error } = await supabase.storage.from("item-images").upload(objectPath, file, { upsert: false, contentType: file.type });
        if (error) throw new Error("upload-failed");
        uploadedPaths.push(objectPath);
      }
    } catch {
      setErrorMessage("حصلت مشكلة أثناء رفع الصور. جرّب تاني."); setSubmissionStage("idle"); setIsSubmitting(false); return;
    }

    const formData = new FormData(form);
    formData.set("title", title);
    formData.set("category_id", categoryId);
    formData.set("city", city);
    formData.set("area", area);
    formData.set("condition", condition);
    formData.set("condition_notes", conditionNotes);
    formData.set("description", description);
    formData.set("item_story", itemStory);
    formData.set("swap_reason", swapReason);
    formData.set("good_for", goodFor);
    formData.set("desire_mode", desireMode);
    formData.set("desire_text", desireText);
    formData.set("wanted_tags", wantedTags);
    formData.set("item_id", draftItemId);
    formData.set("uploaded_image_paths_json", JSON.stringify(uploadedPaths));

    setSubmissionStage("publishing");
    const result = await action(formData);
    if (!result.ok) { setErrorMessage("مش قادرين نعرض الحاجة دلوقتي. جرّب تاني."); setSubmissionStage("idle"); setIsSubmitting(false); return; }
    router.push(`/items/${result.itemId}`); router.refresh();
  };

  return <form onSubmit={onSubmit} className="space-y-4">
    <Card className="space-y-2 p-4">
      <p className="text-sm font-medium text-app-text-secondary">الخطوة {step} من 6</p>
      <p className="text-xl font-semibold text-app-text-primary">{STEP_META[step].title}</p>
      <p className="text-sm text-app-text-muted">{STEP_META[step].purpose}</p>
      <div className="h-2 rounded-full bg-stone-100"><div className="h-2 rounded-full bg-clay" style={{ width: `${(step / 6) * 100}%` }} /></div>
    </Card>
    {authRequired ? <Alert variant="warning">سجّل دخول علشان تفتح للحاجة باب عروض.</Alert> : null}
    {errorMessage ? <Alert variant="danger">{errorMessage}</Alert> : null}

    <Card className="space-y-4 p-4">
      {step === 1 ? <MediaUploadBlock title="خلّيها تتشاف" helperText="الصورة الأولى هتكون الرئيسية. الصور عامة (Public) — ما ترفعش أي بيانات خاصة أو حساسة." errorText={errorMessage ?? undefined}>
        <p className="text-sm text-stone-600">أول إحساس بقيمة الحاجة بيبدأ من إن الناس تشوفها كويس.</p>
        <label className="inline-flex cursor-pointer rounded-button border border-app-border bg-app-surface px-3 py-2 text-sm"><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e)=>{ const selected = Array.from(e.target.files ?? []).slice(0, MAX_FILES); setFiles(selected); setErrorMessage(validateFiles(selected)); }} className="hidden" />اختار الصور</label>
        {previews.length > 0 ? <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{previews.map((src, idx)=><MediaFrame key={src} src={src} alt={`معاينة صورة ${idx + 1}`} ratio="square" />)}</div> : null}
      </MediaUploadBlock> : null}

      {step === 2 ? <div className="space-y-3">
        <h3 className="text-lg font-semibold">عرّفها ببساطة</h3>
        <p className="text-sm text-stone-600">مش محتاج تبيعها بالكلام. سمّيها بوضوح، واكتب مكانًا تقريبيًا يساعد في التنسيق.</p>
        <Field><Label htmlFor="title" required>اسم الحاجة</Label><TextInput id="title" name="title" required value={title} onChange={(e)=>setTitle(e.target.value)} /></Field>
        <Field><Label htmlFor="category_id" required={categories.length > 0}>أقرب تصنيف</Label><Select id="category_id" name="category_id" required={categories.length > 0} value={categoryId} onChange={(e)=>setCategoryId(e.target.value)}><option value="">اختار تصنيف</option>{categories.map((c)=><option key={c.id} value={c.id}>{c.name_ar}</option>)}</Select></Field>
        <div className="grid gap-3 sm:grid-cols-2"><Field><Label htmlFor="city">المدينة</Label><TextInput id="city" name="city" value={city} onChange={(e)=>setCity(e.target.value)} /></Field><Field><Label htmlFor="area">المنطقة</Label><TextInput id="area" name="area" value={area} onChange={(e)=>setArea(e.target.value)} /></Field></div>
      </div> : null}

      {step === 3 ? <div className="space-y-3">
        <h3 className="text-lg font-semibold">قول الحقيقة من الأول</h3>
        <p className="text-sm text-stone-600">الوضوح هنا أهم من التلميع. قول إيه اللي لازم الطرف التاني يعرفه قبل ما يتحمس.</p>
        <Field>
          <Label required>إيه اللي لازم يتعرف بوضوح؟</Label>
          <div className="grid gap-2 sm:grid-cols-2">
            {(Object.entries(TESWA_CONDITION_LANGUAGE) as Array<[TeswaConditionValue, (typeof TESWA_CONDITION_LANGUAGE)[TeswaConditionValue]]>).map(([value, entry]) => <label key={value} className={`cursor-pointer rounded-xl border p-3 ${condition === value ? "border-clay bg-app-accent-soft" : "border-app-border bg-app-surface"}`}><input type="radio" name="condition" value={value} checked={condition === value} onChange={() => setCondition(value)} className="sr-only" /><p className="font-medium">{entry.label}</p><p className="text-xs text-app-text-muted">{entry.helper}</p></label>)}
          </div>
        </Field>
        <Field><Label htmlFor="condition_notes" optional>ملاحظة لازم تبقى واضحة</Label><Textarea id="condition_notes" name="condition_notes" value={conditionNotes} onChange={(e)=>setConditionNotes(e.target.value)} /></Field>
        <Field><Label htmlFor="description" optional>تفاصيل عملية تفيد اللي هيفكر فيها</Label><Textarea id="description" name="description" value={description} onChange={(e)=>setDescription(e.target.value)} /></Field>
        {["minor_issues", "needs_repair"].includes(condition) && !conditionNotes.trim() ? <HelperText className="text-amber-700">اكتب الملاحظة بصراحة علشان الاحتمال يبقى واضح.</HelperText> : null}
      </div> : null}

      {step === 4 ? <div className="space-y-3"><h3 className="text-lg font-semibold">احكي ليه خرجت من عالمك</h3><p className="text-sm text-stone-600">مش مطلوب قصة طويلة. سطر صادق أحيانًا يخلّي حد تاني يشوفها بشكل مختلف.</p>
        <Field><Label htmlFor="item_story" optional>حكايتها باختصار</Label><Textarea id="item_story" name="item_story" maxLength={MAX_ITEM_STORY} value={itemStory} onChange={(e)=>setItemStory(e.target.value)} /><CharacterCount current={itemStory.length} max={MAX_ITEM_STORY} /></Field>
        <Field><Label htmlFor="swap_reason" optional>ليه فاتح لها باب جديد؟</Label><Textarea id="swap_reason" name="swap_reason" maxLength={MAX_SWAP_REASON} value={swapReason} onChange={(e)=>setSwapReason(e.target.value)} /><CharacterCount current={swapReason.length} max={MAX_SWAP_REASON} /></Field>
        <Field><Label htmlFor="good_for" optional>ممكن تناسب مين؟</Label><Textarea id="good_for" name="good_for" maxLength={MAX_GOOD_FOR} value={goodFor} onChange={(e)=>setGoodFor(e.target.value)} /><CharacterCount current={goodFor.length} max={MAX_GOOD_FOR} /></Field>
        <HelperText>الحكاية مش إلزامية، لكنها أحيانًا هي سبب إن حد يقف عند الحاجة.</HelperText>
      </div> : null}

      {step === 5 ? <div className="space-y-3"><h3 className="text-lg font-semibold">افتح باب العروض</h3><p className="text-sm text-stone-600">هنا بتقول للناس: أنا منتظر اتجاهًا واضحًا، ولا فاتح الباب لمفاجآت أوسع؟</p>
        <Field>
          <Label required>نوع الباب المفتوح</Label>
          <div className="grid gap-2 sm:grid-cols-3">{(Object.entries(TESWA_DESIRE_MODE_LANGUAGE) as Array<[TeswaDesireModeValue, (typeof TESWA_DESIRE_MODE_LANGUAGE)[TeswaDesireModeValue]]>).map(([value, entry]) => <label key={value} className={`cursor-pointer rounded-xl border p-3 ${desireMode === value ? "border-clay bg-app-accent-soft" : "border-app-border bg-app-surface"}`}><input type="radio" name="desire_mode" value={value} checked={desireMode === value} onChange={() => setDesireMode(value)} className="sr-only" /><p className="font-medium">{entry.label}</p><p className="text-xs text-app-text-muted">{entry.helper}</p></label>)}</div>
        </Field>
        <Field><Label htmlFor="desire_text" optional>لو عندك اتجاه، اكتبه</Label><Textarea id="desire_text" name="desire_text" value={desireText} onChange={(e)=>setDesireText(e.target.value)} /></Field>
        <Field><Label htmlFor="wanted_tags" optional>كلمات تساعد الناس تفهم ذوقك</Label><TextInput id="wanted_tags" name="wanted_tags" value={wantedTags} onChange={(e)=>setWantedTags(e.target.value)} /><HelperText>مثال: كاميرا، نباتات، كرسي مكتب — سيبها بسيطة ومفيدة.</HelperText></Field>
        <HelperText>كل ما كنت صريحًا في الباب المفتوح، العروض تبقى أقرب لفكرتك.</HelperText>
      </div> : null}

      {step === 6 ? <div className="space-y-3"><h3 className="text-lg font-semibold">راجع الاحتمال قبل ما يخرج للناس</h3><p className="text-sm text-stone-600">دي ليست فاتورة إعلان. دي الصورة التي سيكوّن منها الناس إحساسهم: هل هذه الحاجة تِسوى شيئًا عندي؟</p>
        <div className="space-y-3 rounded-xl border p-3 text-sm">
          {previews.length ? <div className="grid grid-cols-4 gap-2">{previews.map((src)=><img key={src} src={src} alt="معاينة" className="h-16 w-full rounded object-cover" />)}</div> : null}
          <div><p className="text-xs text-app-text-muted">الحاجة</p><p className="font-medium">{title || "بدون عنوان"}</p><p>{categories.find((c)=>c.id===categoryId)?.name_ar ?? "بدون تصنيف"}</p><p>{[city, area].filter(Boolean).join(" - ") || "الموقع غير مضاف"}</p></div>
          <div><p className="text-xs text-app-text-muted">اللي لازم يتعرف</p><p>{TESWA_CONDITION_LANGUAGE[condition].label}</p>{conditionNotes ? <p>{conditionNotes}</p> : null}{description ? <p>{description}</p> : null}</div>
          <div><p className="text-xs text-app-text-muted">ليه هي هنا</p>{itemStory ? <p>{itemStory}</p> : null}{swapReason ? <p>{swapReason}</p> : null}{goodFor ? <p>{goodFor}</p> : null}</div>
          <div><p className="text-xs text-app-text-muted">الباب المفتوح للعروض</p><p>{TESWA_DESIRE_MODE_LANGUAGE[desireMode].label}</p>{desireText ? <p>{desireText}</p> : null}{wantedTags ? <div className="flex flex-wrap gap-1">{wantedTags.split(",").map((tag)=>tag.trim()).filter(Boolean).map((tag)=><span key={tag} className="rounded-full bg-stone-100 px-2 py-1 text-xs">{tag}</span>)}</div> : null}</div>
          <p className="text-xs text-stone-500">تذكير: الصور عامة (Public)، بلاش أي بيانات حساسة.</p>
        </div>
      </div> : null}
    </Card>

    <FormActions className="justify-between">
      <Button type="button" variant="outline" onClick={goBack} disabled={step === 1 || isSubmitting}>السابق</Button>
      {step < 6 ? <Button type="button" onClick={goNext} disabled={isSubmitting}>كمّل</Button> : <Button type="submit" loading={isSubmitting}>افتح باب العروض</Button>}
    </FormActions>

    {isSubmitting ? <ProcessingState title={submissionStage === "publishing" ? "جاري فتح باب العروض" : "جاري رفع الصور"} body="يرجى الانتظار..." tone="info" /> : null}
  </form>;
}
