"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { MediaFrame, MediaUploadBlock, ProcessingState } from "@/components/ui/product-primitives";

type Category = { id: string; name_ar: string };

type Props = {
  categories: Category[];
  prefill: string;
  action: (formData: FormData) => Promise<{ ok: true; itemId: string } | { ok: false; error: "validation" | "publish" }>;
  authRequired?: boolean;
  userId: string | null;
  draftItemId: string;
};

type Step = 1 | 2 | 3 | 4 | 5 | 6;

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILES = 4;
const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_ITEM_STORY = 600;
const MAX_SWAP_REASON = 240;
const MAX_GOOD_FOR = 240;

const conditionLabels = {
  almost_new: "جديد تقريبًا",
  good_used: "مستخدم بحالة كويسة",
  minor_issues: "فيه عيوب بسيطة",
  needs_repair: "محتاج تصليح / عارف حالته",
};

const desireLabels = {
  specific: "بدور على حاجة معينة",
  flexible: "ممكن حاجات مختلفة",
  surprise: "فاجئني تمامًا",
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
  const [condition, setCondition] = useState<keyof typeof conditionLabels>("good_used");
  const [conditionNotes, setConditionNotes] = useState("");
  const [description, setDescription] = useState("");
  const [itemStory, setItemStory] = useState("");
  const [swapReason, setSwapReason] = useState("");
  const [goodFor, setGoodFor] = useState("");
  const [desireMode, setDesireMode] = useState<keyof typeof desireLabels>("flexible");
  const [desireText, setDesireText] = useState("");
  const [wantedTags, setWantedTags] = useState("");
  const router = useRouter();

  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);
  const stepTitles: Record<Step, string> = { 1: "صور الحاجة", 2: "الأساسيات", 3: "الحالة والوضوح", 4: "قصة الحاجة", 5: "عايز إيه بدلها؟", 6: "راجع وانشر" };

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
    if (step === 2 && !title.trim()) return "اكتب عنوان واضح للحاجة.";
    if (step === 2 && categories.length > 0 && !categoryId) return "اختار تصنيف مناسب.";
    if (step === 3 && !condition) return "اختار حالة الحاجة.";
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
    if (!userId || authRequired) return setErrorMessage("سجّل دخول عشان ترفع صور الحاجة وتنشر الإعلان.");

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
    // Earlier wizard-step inputs are unmounted by Step 6, so final publish must serialize from component state.
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
    if (!result.ok) { setErrorMessage("مش قادرين ننشر الإعلان دلوقتي. جرّب تاني."); setSubmissionStage("idle"); setIsSubmitting(false); return; }
    router.push(`/items/${result.itemId}`); router.refresh();
  };

  return <form onSubmit={onSubmit} className="space-y-4">
    <Card className="p-4"><p className="text-sm text-stone-600">الخطوة {step} من 6 — {stepTitles[step]}</p><div className="mt-2 h-2 rounded-full bg-stone-100"><div className="h-2 rounded-full bg-clay" style={{ width: `${(step / 6) * 100}%` }} /></div></Card>
    {authRequired ? <Alert variant="warning">سجّل دخول عشان ترفع صور الحاجة وتنشر الإعلان.</Alert> : null}
    {errorMessage ? <Alert variant="danger">{errorMessage}</Alert> : null}

    <Card className="space-y-3 p-4">
      {step === 1 ? <>
        <MediaUploadBlock title="ابدأ بالصور" helperText="الصورة الأولى هتكون الرئيسية. الصور عامة (Public) — ما ترفعش أي بيانات خاصة أو حساسة." errorText={errorMessage ?? undefined}><p className="text-sm text-stone-600">الناس بتفهم الحاجة من الصورة قبل أي كلام. خليك واضح، مش لازم تصوير احترافي.</p>
        <label className="inline-flex cursor-pointer rounded-button border border-app-border bg-app-surface px-3 py-2 text-sm"><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e)=>{ const selected = Array.from(e.target.files ?? []).slice(0, MAX_FILES); setFiles(selected); setErrorMessage(validateFiles(selected)); }} className="hidden" />اختار الصور</label>
        {previews.length > 0 ? <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{previews.map((src, idx)=><MediaFrame key={src} src={src} alt={`معاينة صورة ${idx + 1}`} ratio="square" />)}</div> : null}
      </MediaUploadBlock>
      </> : null}

      {step === 2 ? <><h3 className="text-lg font-semibold">خلّي الحاجة مفهومة</h3><p className="text-sm text-stone-600">اكتب اسم واضح، وحط مكان تقريبي يساعد الناس تعرف لو التنسيق مناسب.</p><input name="title" required value={title} onChange={(e)=>setTitle(e.target.value)} className="w-full rounded-xl border px-3 py-2" placeholder="عنوان الحاجة" /><select name="category_id" required={categories.length > 0} value={categoryId} onChange={(e)=>setCategoryId(e.target.value)} className="w-full rounded-xl border px-3 py-2"><option value="">اختار تصنيف</option>{categories.map((c)=><option key={c.id} value={c.id}>{c.name_ar}</option>)}</select><div className="grid gap-3 sm:grid-cols-2"><input name="city" value={city} onChange={(e)=>setCity(e.target.value)} placeholder="المدينة" className="rounded-xl border px-3 py-2" /><input name="area" value={area} onChange={(e)=>setArea(e.target.value)} placeholder="المنطقة" className="rounded-xl border px-3 py-2" /></div></> : null}
      {step === 3 ? <><h3 className="text-lg font-semibold">قول حالتها بصراحة</h3><p className="text-sm text-stone-600">الوصف الصريح بيقلل المشاكل وبيخلّي العرض المناسب يوصلك أسرع.</p><select name="condition" required value={condition} onChange={(e)=>setCondition(e.target.value as keyof typeof conditionLabels)} className="w-full rounded-xl border px-3 py-2"><option value="almost_new">جديد تقريبًا</option><option value="good_used">مستخدم بحالة كويسة</option><option value="minor_issues">فيه عيوب بسيطة</option><option value="needs_repair">محتاج تصليح / عارف حالته</option></select><textarea name="condition_notes" value={conditionNotes} onChange={(e)=>setConditionNotes(e.target.value)} className="w-full rounded-xl border px-3 py-2" placeholder="ملاحظات الحالة" /><textarea name="description" value={description} onChange={(e)=>setDescription(e.target.value)} className="w-full rounded-xl border px-3 py-2" placeholder="وصف عملي للحاجة" />{["minor_issues","needs_repair"].includes(condition) && !conditionNotes.trim() ? <p className="text-xs text-amber-700">يفضّل تكتب ملاحظات الحالة بصراحة.</p> : null}</> : null}
      {step === 4 ? <><h3 className="text-lg font-semibold">إيه حكاية الحاجة دي؟</h3><p className="text-sm text-stone-600">مش لازم قصة كبيرة. قول استخدمتها في إيه، أو ليه لسه شايف إن ليها قيمة.</p><textarea name="item_story" maxLength={MAX_ITEM_STORY} value={itemStory} onChange={(e)=>setItemStory(e.target.value)} className="w-full rounded-xl border px-3 py-2" placeholder="مثال: الكاميرا دي استخدمتها في أول مشروع تصوير ليا." /><p className="text-xs text-stone-500">{itemStory.length}/{MAX_ITEM_STORY}</p><textarea name="swap_reason" maxLength={MAX_SWAP_REASON} value={swapReason} onChange={(e)=>setSwapReason(e.target.value)} className="w-full rounded-xl border px-3 py-2" placeholder="مثال: مبقتش بستخدمها وعايز حاجة تنفعني أكتر." /><p className="text-xs text-stone-500">{swapReason.length}/{MAX_SWAP_REASON}</p><textarea name="good_for" maxLength={MAX_GOOD_FOR} value={goodFor} onChange={(e)=>setGoodFor(e.target.value)} className="w-full rounded-xl border px-3 py-2" placeholder="مثال: مناسبة لحد لسه بيبدأ في التصوير." /><p className="text-xs text-stone-500">{goodFor.length}/{MAX_GOOD_FOR}</p><p className="text-xs text-stone-500">القصة اختيارية، لكن بتخلّي الإعلان أصدق وأقرب.</p></> : null}
      {step === 5 ? <><h3 className="text-lg font-semibold">عايز إيه بدلها؟</h3><p className="text-sm text-stone-600">ممكن تكون محدد، مرن، أو مفتوح للمفاجأة.</p><select name="desire_mode" required value={desireMode} onChange={(e)=>setDesireMode(e.target.value as keyof typeof desireLabels)} className="w-full rounded-xl border px-3 py-2"><option value="specific">بدور على حاجة معينة</option><option value="flexible">عندي حاجات في بالي، بس فاجئني</option><option value="surprise">فاجئني تمامًا</option></select><textarea name="desire_text" value={desireText} onChange={(e)=>setDesireText(e.target.value)} className="w-full rounded-xl border px-3 py-2" placeholder="لو في مواصفات مهمة، اكتبها." /><input name="wanted_tags" value={wantedTags} onChange={(e)=>setWantedTags(e.target.value)} className="w-full rounded-xl border px-3 py-2" placeholder="كلمات تساعدنا نفهم نوع الحاجات اللي ممكن تناسبك." /></> : null}
      {step === 6 ? <><h3 className="text-lg font-semibold">راجع وانشر</h3><p className="text-sm text-stone-600">ده شكل الإعلان اللي هيطلع للناس بشكل مبسط.</p><div className="space-y-2 rounded-xl border p-3 text-sm">{previews.length ? <div className="grid grid-cols-4 gap-2">{previews.map((src)=><img key={src} src={src} alt="معاينة" className="h-16 w-full rounded object-cover" />)}</div> : null}<p><strong>{title || "بدون عنوان"}</strong></p><p>{categories.find((c)=>c.id===categoryId)?.name_ar ?? "بدون تصنيف"}</p><p>{[city, area].filter(Boolean).join(" - ") || "الموقع غير مضاف"}</p><p>{conditionLabels[condition]}</p>{description ? <p>{description}</p> : null}{conditionNotes ? <p>{conditionNotes}</p> : null}{itemStory ? <p>{itemStory}</p> : null}{swapReason ? <p><span className="font-medium">ليه بيتبدّل؟ </span>{swapReason}</p> : null}{goodFor ? <p><span className="font-medium">مناسب لمين؟ </span>{goodFor}</p> : null}<p>{desireLabels[desireMode]}</p>{desireText ? <p>{desireText}</p> : null}{wantedTags ? <div className="flex flex-wrap gap-1">{wantedTags.split(",").map((tag)=>tag.trim()).filter(Boolean).map((tag)=><span key={tag} className="rounded-full bg-stone-100 px-2 py-1 text-xs">{tag}</span>)}</div> : null}<p className="text-xs text-stone-500">تذكير: الصور عامة (Public)، بلاش أي بيانات حساسة.</p></div></> : null}
    </Card>

    <div className="flex items-center justify-between gap-3">
      <button type="button" onClick={goBack} disabled={step === 1 || isSubmitting} className="rounded-xl border px-4 py-2 disabled:opacity-50">السابق</button>
      {step < 6 ? <button type="button" onClick={goNext} disabled={isSubmitting} className="rounded-xl bg-clay px-5 py-2 text-white">التالي</button> : <button disabled={isSubmitting} className="rounded-xl bg-clay px-5 py-2 text-white disabled:opacity-60">انشر الإعلان</button>}
    </div>
    {isSubmitting ? <ProcessingState title={submissionStage === "publishing" ? "جاري نشر الإعلان" : "جاري رفع الصور"} body="يرجى الانتظار..." tone="info" /> : null}
  </form>;
}
