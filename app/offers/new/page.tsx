import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createOffer } from "./actions";

type MaybeArray<T> = T | T[] | null | undefined;
const firstOrNull = <T,>(value: MaybeArray<T>): T | null => (!value ? null : Array.isArray(value) ? value[0] ?? null : value);

type Row = {
  id: string; owner_id: string; title: string; condition: "almost_new"|"good_used"|"minor_issues"|"needs_repair"; status: string; desire_mode: "specific"|"flexible"|"surprise"; desire_text: string|null;
  categories: MaybeArray<{name_ar:string|null}>; item_images: Array<{image_url:string|null;is_primary:boolean|null}>|null; profiles: MaybeArray<{display_name:string|null}>;
};

const conditionLabels = { almost_new: "جديد تقريبًا", good_used: "مستخدم بحالة كويسة", minor_issues: "فيه عيوب بسيطة", needs_repair: "محتاج تصليح / عارف حالته" };

export default async function NewOfferPage({ searchParams }: { searchParams: Promise<{ requestedItemId?: string; error?: string }> }) {
  const params = await searchParams;
  const requestedItemId = params.requestedItemId?.trim();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/offers/new?requestedItemId=${encodeURIComponent(requestedItemId ?? "")}`);
  }

  if (!requestedItemId) return <section className="mx-auto max-w-3xl p-8">مش لاقيين الحاجة اللي عايز تعرض عليها.</section>;

  const { data: requested } = await supabase.from("items").select("id,owner_id,title,condition,status,desire_mode,desire_text,categories(name_ar),item_images(image_url,is_primary),profiles!items_owner_id_fkey(display_name)").eq("id", requestedItemId).maybeSingle();
  const { data: ownItems } = await supabase.from("items").select("id,owner_id,title,condition,status,categories(name_ar),item_images(image_url,is_primary)").eq("owner_id", user.id).eq("status", "active").order("created_at", { ascending: false });
  const { data: categories } = await supabase.from("categories").select("id,name_ar").eq("is_active", true).order("sort_order", { ascending: true });

  const req = requested as unknown as Row | null;

  if (!req || req.status !== "active") return <section className="mx-auto max-w-3xl p-8">الحاجة دي مش متاحة للعروض دلوقتي.</section>;
  if (req.owner_id === user.id || params.error === "own_item") return <section className="mx-auto max-w-3xl space-y-4 p-8"><p>دي حاجتك أنت. مينفعش تعرض على حاجة بتاعتك.</p><Link className="underline" href="/items">ارجع للسوق</Link></section>;

  const reqImg = req.item_images?.find((img) => img.is_primary)?.image_url ?? req.item_images?.[0]?.image_url ?? null;
  const reqOwner = firstOrNull(req.profiles);
  const reqCat = firstOrNull(req.categories);

  return <section className="mx-auto max-w-4xl space-y-5 px-4 py-10">
    <h1 className="text-3xl font-bold">اعرض حاجة عندك</h1>
    <p>اختار حاجة من حاجاتك، أو نزّل حاجة جديدة بسرعة عشان تعرضها على الإعلان ده.</p>
    {params.error ? <p className="rounded-xl bg-red-50 p-3 text-red-700">مش قادرين نبعت العرض دلوقتي. جرّب تاني.</p> : null}
    <div className="rounded-2xl border p-4">{reqImg ? <img src={reqImg} alt={req.title} className="mb-2 aspect-video w-full rounded-xl object-cover" /> : null}<p className="font-semibold">{req.title}</p><p>{reqCat?.name_ar ?? "بدون تصنيف"}</p><p>{conditionLabels[req.condition]}</p><p>صاحبها: {reqOwner?.display_name ?? "مستخدم"}</p>{req.desire_text ? <p>{req.desire_text}</p> : null}</div>
    <form action={createOffer} className="space-y-5 rounded-2xl border p-4">
      <input type="hidden" name="requested_item_id" value={requestedItemId} />
      <div>
        <p className="mb-2 font-semibold">اختار طريقة العرض</p>
        <label className="mr-4"><input defaultChecked type="radio" name="offer_mode" value="existing_item" /> اختار من حاجاتك</label>
        <label><input type="radio" name="offer_mode" value="new_item" /> نزّل حاجة جديدة كعرض</label>
      </div>
      <div><label>الحاجة اللي هتعرضها من الموجود</label><select name="offered_item_id" className="mt-1 w-full rounded-xl border px-3 py-2"><option value="">لازم تختار حاجة تعرضها</option>{(ownItems ?? []).filter((it) => it.id !== requestedItemId).map((it) => <option key={it.id} value={it.id}>{it.title}</option>)}</select>{(ownItems ?? []).length === 0 ? <p className="mt-2 text-sm text-stone-600">لسه ماعندكش حاجات معروضة. ممكن تنزّل حاجة جديدة دلوقتي وتبعتها كعرض.</p> : null}</div>
      <div className="space-y-2 rounded-xl border border-dashed p-3"><p className="font-semibold">نزّل حاجة جديدة كعرض</p>
      <input name="title" placeholder="عنوان الحاجة" className="w-full rounded-xl border px-3 py-2" />
      <select name="category_id" className="w-full rounded-xl border px-3 py-2"><option value="">اختار تصنيف</option>{(categories ?? []).map((c) => <option value={c.id} key={c.id}>{c.name_ar}</option>)}</select>
      <input name="image_url" type="url" placeholder="رابط الصورة" className="w-full rounded-xl border px-3 py-2" />
      <textarea name="description" placeholder="وصف" className="w-full rounded-xl border px-3 py-2" />
      <select name="condition" defaultValue="good_used" className="w-full rounded-xl border px-3 py-2"><option value="almost_new">جديد تقريبًا</option><option value="good_used">مستخدم بحالة كويسة</option><option value="minor_issues">فيه عيوب بسيطة</option><option value="needs_repair">محتاج تصليح / عارف حالته</option></select>
      <textarea name="condition_notes" placeholder="ملاحظات الحالة" className="w-full rounded-xl border px-3 py-2" />
      <div className="grid gap-2 sm:grid-cols-2"><input name="city" placeholder="المدينة" className="rounded-xl border px-3 py-2" /><input name="area" placeholder="المنطقة" className="rounded-xl border px-3 py-2" /></div>
      <select name="desire_mode" defaultValue="flexible" className="w-full rounded-xl border px-3 py-2"><option value="specific">بدور على حاجة معينة</option><option value="flexible">عندي حاجات في بالي، بس فاجئني</option><option value="surprise">فاجئني تمامًا</option></select>
      <textarea name="desire_text" placeholder="عايز إيه" className="w-full rounded-xl border px-3 py-2" />
      <input name="wanted_tags" placeholder="مثال: مكتب, ديكور" className="w-full rounded-xl border px-3 py-2" />
      <p className="rounded-xl bg-blue-50 p-3 text-sm text-blue-900">الحاجة اللي هتنزلها هنا هتبقى إعلان ظاهر في السوق كمان. ده يزوّد فرصها حتى لو العرض ده ما ظبطش.</p>
      </div>
      <div><label className="mb-1 block">اكتب رسالة قصيرة لصاحب الحاجة</label><textarea name="message" placeholder="شايفها صفقة غريبة بس نافعة." className="w-full rounded-xl border px-3 py-2" /></div>
      <div className="rounded-xl bg-stone-50 p-3">مراجعة: الحاجة اللي هتعرضها ↔ {req.title}</div>
      <button className="rounded-xl bg-clay px-5 py-3 text-white">ابعت العرض</button>
    </form>
  </section>;
}
