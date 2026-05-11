"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Category = { id: string; name_ar: string };

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

function makeSafeFilename(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]/g, "")
    .replace(/-+/g, "-")
    .slice(0, 120);
}

export function ItemForm({ categories, prefill, action, authRequired = false, userId, draftItemId }: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [files, setFiles] = useState<File[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStage, setSubmissionStage] = useState<"idle" | "uploading" | "publishing">("idle");
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

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setErrorMessage(null);

    if (!userId || authRequired) {
      setErrorMessage("سجّل دخول عشان ترفع صور الحاجة وتنشر الإعلان.");
      return;
    }

    const validationError = validateFiles(files);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsSubmitting(true);
    setSubmissionStage("uploading");

    const uploadedPaths: string[] = [];

    try {
      for (const file of files) {
        const safeName = makeSafeFilename(file.name || "image");
        const objectPath = `items/${userId}/${draftItemId}/${Date.now()}-${safeName}`;
        const { error } = await supabase.storage.from("item-images").upload(objectPath, file, {
          upsert: false,
          contentType: file.type,
        });

        if (error) {
          throw new Error("upload-failed");
        }

        uploadedPaths.push(objectPath);
      }
    } catch (error) {
      console.error("Item image upload failed", error);
      setErrorMessage("حصلت مشكلة أثناء رفع الصور. جرّب تاني.");
      setSubmissionStage("idle");
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData(form);
      formData.set("item_id", draftItemId);
      formData.set("uploaded_image_paths_json", JSON.stringify(uploadedPaths));

      setSubmissionStage("publishing");
      const result = await action(formData);

      if (result.ok) {
        router.push(`/items/${result.itemId}`);
        router.refresh();
        return;
      }

      setErrorMessage("مش قادرين ننشر الإعلان دلوقتي. جرّب تاني.");
      setSubmissionStage("idle");
      setIsSubmitting(false);
    } catch (error) {
      console.error("Item publish failed", error);
      setErrorMessage("مش قادرين ننشر الإعلان دلوقتي. جرّب تاني.");
      setSubmissionStage("idle");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5">
      <div className="rounded-xl bg-sand p-3 text-sm text-ink">1) صور الحاجة • 2) وصف واضح • 3) حالتها • 4) عايز إيه بدلها • 5) مكان عام للتنسيق</div>
      {authRequired ? <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">سجّل دخول عشان ترفع صور الحاجة وتنشر الإعلان.</p> : null}
      <div>
        <label className="mb-1 block text-sm font-medium">عنوان الحاجة</label>
        <input name="title" required defaultValue={prefill} className="w-full rounded-xl border border-stone-300 px-3 py-2" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">التصنيف</label>
        <select name="category_id" required={categories.length > 0} className="w-full rounded-xl border border-stone-300 px-3 py-2">
          <option value="">اختار تصنيف</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">صور الحاجة</label>
        <p className="mb-2 text-xs text-stone-500">مش لازم تكون الصورة مثالية، المهم تبقى واضحة. اختار من 1 إلى 4 صور واضحة. الصيغ المدعومة: JPG / PNG / WEBP. الحد الأقصى 5MB لكل صورة. أول صورة هتبقى الصورة الرئيسية. الصور المعروضة في السوق عامة (Public) — ما ترفعش أي بيانات خاصة أو حساسة.</p>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(event) => {
            const selectedFiles = Array.from(event.target.files ?? []).slice(0, MAX_FILES);
            const validationError = validateFiles(selectedFiles);
            setFiles(selectedFiles);
            setErrorMessage(validationError);
          }}
          className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
          aria-label="لو صورة من الموبايل مش راضية تترفع، جرّب Screenshot أو صورة JPG. تنبيه: ما ترفعش أرقام موبايل/عناوين/بطاقات هوية/مستندات خاصة."
        />
        <p className="mt-1 text-xs text-stone-500">لو صورة من الموبايل مش راضية تترفع، جرّب Screenshot أو صورة JPG. تنبيه: ما ترفعش أرقام موبايل/عناوين/بطاقات هوية/مستندات خاصة.</p>
        {previews.length > 0 ? (
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {previews.map((src, idx) => (
              <img key={src} src={src} alt={`معاينة صورة ${idx + 1}`} className="h-24 w-full rounded-lg object-cover" />
            ))}
          </div>
        ) : null}
      </div>
      <div><label className="mb-1 block text-sm font-medium">وصف إضافي</label><textarea name="description" className="w-full rounded-xl border border-stone-300 px-3 py-2" /></div>
      <div><label className="mb-1 block text-sm font-medium">الحالة</label><select name="condition" required defaultValue="good_used" className="w-full rounded-xl border border-stone-300 px-3 py-2"><option value="almost_new">جديد تقريبًا</option><option value="good_used">مستخدم بحالة كويسة</option><option value="minor_issues">فيه عيوب بسيطة</option><option value="needs_repair">محتاج تصليح / عارف حالته</option></select></div>
      <div><label className="mb-1 block text-sm font-medium">ملاحظات الحالة (مهم جدًا)</label><p className="mb-1 text-xs text-stone-500">اكتب العيب بصراحة لو موجود. الصراحة بتقلل المشاكل.</p><textarea name="condition_notes" className="w-full rounded-xl border border-stone-300 px-3 py-2" /></div>
      <div className="grid gap-3 sm:grid-cols-2"><input name="city" placeholder="المدينة" className="rounded-xl border border-stone-300 px-3 py-2" /><input name="area" placeholder="المنطقة" className="rounded-xl border border-stone-300 px-3 py-2" /></div>
      <div><label className="mb-1 block text-sm font-medium">إنت عايز إيه؟</label><p className="mb-1 text-xs text-stone-500">لو مش عارف عايز إيه، اختار فاجئني.</p><select name="desire_mode" required defaultValue="flexible" className="w-full rounded-xl border border-stone-300 px-3 py-2"><option value="specific">بدور على حاجة معينة</option><option value="flexible">عندي حاجات في بالي، بس فاجئني</option><option value="surprise">فاجئني تمامًا</option></select></div>
      <div><label className="mb-1 block text-sm font-medium">تفاصيل إضافية عن اللي بدور عليه (مثال: مقاس، نوع، حالة)</label><textarea name="desire_text" className="w-full rounded-xl border border-stone-300 px-3 py-2" /></div>
      <div><label className="mb-1 block text-sm font-medium">كلمات مفتاحية للحاجة اللي محتاجها (افصل بينهم بفاصلة)</label><input name="wanted_tags" placeholder="مثال: مكتب, ديكور, خشب" className="w-full rounded-xl border border-stone-300 px-3 py-2" /></div>
      {isSubmitting ? (
        <p className="rounded-xl bg-blue-50 p-3 text-sm text-blue-900">
          {submissionStage === "publishing" ? "جاري نشر الإعلان..." : "جاري رفع الصور..."}
        </p>
      ) : null}
      {errorMessage ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{errorMessage}</p> : null}
      <p className="rounded-xl bg-blue-50 p-3 text-sm text-blue-900">لو العنوان فيه أكتر من حاجة مش مرتبطين: خلّي كل حاجة تاخد فرصتها لوحدها. السفرة إعلان، والدولاب إعلان، والأباجورة إعلان. كده فرصك تزيد.</p>
      <button disabled={isSubmitting} className="rounded-xl bg-clay px-5 py-3 text-white disabled:opacity-60">انشرها</button>
    </form>
  );
}
