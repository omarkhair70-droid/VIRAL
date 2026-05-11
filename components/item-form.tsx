"use client";

type Category = { id: string; name_ar: string };

type Props = {
  categories: Category[];
  prefill: string;
  action: (formData: FormData) => void;
  authRequired?: boolean;
};

export function ItemForm({ categories, prefill, action, authRequired = false }: Props) {
  return (
    <form action={action} className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5">
      {authRequired ? <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">لازم تسجل دخول عشان تنشر إعلانك.</p> : null}
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
        <label className="mb-1 block text-sm font-medium">رابط صورة واضح للحاجة</label>
        <input name="image_url" type="url" required className="w-full rounded-xl border border-stone-300 px-3 py-2" />
        <p className="mt-1 text-xs text-stone-500">رفع الصور الحقيقي هيتظبط في مرحلة جاية. دلوقتي استخدم رابط صورة للتجربة.</p>
      </div>
      <div><label className="mb-1 block text-sm font-medium">وصف إضافي</label><textarea name="description" className="w-full rounded-xl border border-stone-300 px-3 py-2" /></div>
      <div><label className="mb-1 block text-sm font-medium">الحالة</label><select name="condition" required defaultValue="good_used" className="w-full rounded-xl border border-stone-300 px-3 py-2"><option value="almost_new">جديد تقريبًا</option><option value="good_used">مستخدم بحالة كويسة</option><option value="minor_issues">فيه عيوب بسيطة</option><option value="needs_repair">محتاج تصليح / عارف حالته</option></select></div>
      <div><label className="mb-1 block text-sm font-medium">فيه حاجة لازم الطرف التاني يعرفها؟</label><textarea name="condition_notes" className="w-full rounded-xl border border-stone-300 px-3 py-2" /></div>
      <div className="grid gap-3 sm:grid-cols-2"><input name="city" placeholder="المدينة" className="rounded-xl border border-stone-300 px-3 py-2" /><input name="area" placeholder="المنطقة" className="rounded-xl border border-stone-300 px-3 py-2" /></div>
      <div><label className="mb-1 block text-sm font-medium">إنت عايز إيه؟</label><select name="desire_mode" required defaultValue="flexible" className="w-full rounded-xl border border-stone-300 px-3 py-2"><option value="specific">بدور على حاجة معينة</option><option value="flexible">عندي حاجات في بالي، بس فاجئني</option><option value="surprise">فاجئني تمامًا</option></select></div>
      <div><label className="mb-1 block text-sm font-medium">تفاصيل إضافية عن اللي بدور عليه</label><textarea name="desire_text" className="w-full rounded-xl border border-stone-300 px-3 py-2" /></div>
      <div><label className="mb-1 block text-sm font-medium">كلمات مفتاحية للحاجة اللي محتاجها</label><input name="wanted_tags" placeholder="مثال: مكتب, ديكور, خشب" className="w-full rounded-xl border border-stone-300 px-3 py-2" /></div>
      <p className="rounded-xl bg-blue-50 p-3 text-sm text-blue-900">لو العنوان فيه أكتر من حاجة مش مرتبطين: خلّي كل حاجة تاخد فرصتها لوحدها. السفرة إعلان، والدولاب إعلان، والأباجورة إعلان. كده فرصك تزيد.</p>
      <button className="rounded-xl bg-clay px-5 py-3 text-white">انشرها</button>
    </form>
  );
}
