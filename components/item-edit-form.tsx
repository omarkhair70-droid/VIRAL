"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Field, FormActions, FormSection, HelperText, Label, Select, TextInput, Textarea } from "@/components/ui/form";
import { InlineNotice } from "@/components/ui/surfaces";

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" loading={pending}>{pending ? "جاري الحفظ..." : "حفظ التعديلات"}</Button>;
}

export function ItemEditForm({ item, categories, action }: { item: { id: string; title: string; category_id: string | null; description: string | null; condition: string; condition_notes: string | null; city: string | null; area: string | null; desire_mode: string; desire_text: string | null; item_story: string | null; swap_reason: string | null; good_for: string | null; wanted_tags: string; }; categories: Array<{ id: string; name_ar: string }>; action: (formData: FormData) => Promise<void>; }) {
  return <form action={action} className="space-y-4 rounded-surface border border-app-border bg-app-surface p-panel-md">
    <input type="hidden" name="item_id" value={item.id} />
    <InlineNotice tone="warning">تعديل الصور جاي بعدين. دلوقتي تقدر تعدّل تفاصيل الإعلان.</InlineNotice>
    <FormSection>
      <Field><Label htmlFor="title" required>عنوان الحاجة</Label><TextInput id="title" name="title" defaultValue={item.title} required /></Field>
      <Field><Label htmlFor="category_id">التصنيف</Label><Select id="category_id" name="category_id" defaultValue={item.category_id ?? ""}><option value="">بدون تصنيف</option>{categories.map((c)=><option key={c.id} value={c.id}>{c.name_ar}</option>)}</Select></Field>
      <Field><Label htmlFor="description" optional>وصف مختصر</Label><Textarea id="description" name="description" defaultValue={item.description ?? ""} /></Field>
      <Field><Label htmlFor="condition">حالة الحاجة</Label><Select id="condition" name="condition" defaultValue={item.condition}><option value="almost_new">جديد تقريبًا</option><option value="good_used">مستخدم بحالة كويسة</option><option value="minor_issues">فيه عيوب بسيطة</option><option value="needs_repair">محتاج تصليح / عارف حالته</option></Select></Field>
      <Field><Label htmlFor="condition_notes" optional>ملاحظات الحالة</Label><Textarea id="condition_notes" name="condition_notes" defaultValue={item.condition_notes ?? ""} /></Field>
      <div className="grid gap-3 sm:grid-cols-2"><Field><Label htmlFor="city" optional>المدينة</Label><TextInput id="city" name="city" defaultValue={item.city ?? ""} /></Field><Field><Label htmlFor="area" optional>المنطقة</Label><TextInput id="area" name="area" defaultValue={item.area ?? ""} /></Field></div>
      <Field><Label htmlFor="item_story" optional>قصة الحاجة</Label><Textarea id="item_story" name="item_story" maxLength={600} defaultValue={item.item_story ?? ""} /></Field>
      <Field><Label htmlFor="swap_reason" optional>سبب التبديل</Label><Textarea id="swap_reason" name="swap_reason" maxLength={240} defaultValue={item.swap_reason ?? ""} /></Field>
      <Field><Label htmlFor="good_for" optional>مناسبة لمين؟</Label><Textarea id="good_for" name="good_for" maxLength={240} defaultValue={item.good_for ?? ""} /></Field>
      <Field><Label htmlFor="desire_mode">نوع المطلوب</Label><Select id="desire_mode" name="desire_mode" defaultValue={item.desire_mode}><option value="specific">بدور على حاجة معينة</option><option value="flexible">مرن في نوع الحاجة</option><option value="surprise">مفتوح لأي حاجة مناسبة</option></Select></Field>
      <Field><Label htmlFor="desire_text" optional>تفاصيل إضافية</Label><Textarea id="desire_text" name="desire_text" defaultValue={item.desire_text ?? ""} /></Field>
      <Field><Label htmlFor="wanted_tags" optional>كلمات مفتاحية</Label><TextInput id="wanted_tags" name="wanted_tags" defaultValue={item.wanted_tags} /><HelperText>مثال: كرسي, مكتب, نباتات</HelperText></Field>
    </FormSection>
    <FormActions><SubmitButton /></FormActions>
  </form>;
}
