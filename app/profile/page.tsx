import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { updateProfile } from "./actions";
import { createClient } from "@/lib/supabase/server";

type PageParams = { searchParams?: Promise<{ updated?: string; error?: string }> };

export default async function ProfilePage({ searchParams }: PageParams) {
  const query = (await searchParams) ?? {};
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/profile");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name,username,city,area,bio,avatar_url,cover_url,interests,swap_preferences,preferred_categories,profile_tagline")
    .eq("id", user.id)
    .maybeSingle();

  const username = profile?.username ?? "";
  const isIncomplete = !profile?.display_name || !username;

  return <section className="mx-auto max-w-3xl space-y-5 px-4 py-10">
    <h1 className="text-3xl font-bold">ظبّط بروفايلك</h1>
    <p className="text-sm text-stone-600">البروفايل الواضح بيخلّي الناس تفهمك وتتعامل معاك بثقة.</p>
    {query.updated ? <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-800">تم تحديث بروفايلك بنجاح.</p> : null}
    {query.error ? <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-800">{query.error}</p> : null}
    {isIncomplete ? <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900">كمّل الاسم واسم المستخدم عشان بروفايلك العام يبقى واضح للناس.</p> : null}

    <form action={updateProfile} className="space-y-5 rounded-2xl border bg-white p-5" encType="multipart/form-data">
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">الهوية البصرية</h2>
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-sm text-amber-900">صور البروفايل بتظهر للناس. ما ترفعش صور فيها بيانات خاصة.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><p className="mb-2 text-sm font-medium">الأفاتار</p>{profile?.avatar_url ? <Image src={profile.avatar_url} alt="avatar" width={88} height={88} className="mb-2 h-22 w-22 rounded-full object-cover" /> : <div className="mb-2 flex h-22 w-22 items-center justify-center rounded-full border bg-stone-100 text-sm">بدون صورة</div>}<input type="file" name="avatar_file" accept="image/jpeg,image/png,image/webp" className="w-full text-sm" /></div>
          <div><p className="mb-2 text-sm font-medium">صورة الغلاف</p>{profile?.cover_url ? <Image src={profile.cover_url} alt="cover" width={320} height={88} className="mb-2 h-22 w-full rounded-xl object-cover" /> : <div className="mb-2 flex h-22 w-full items-center justify-center rounded-xl border bg-stone-100 text-sm">بدون غلاف</div>}<input type="file" name="cover_file" accept="image/jpeg,image/png,image/webp" className="w-full text-sm" /></div>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div><label htmlFor="display_name" className="mb-1 block text-sm font-medium">الاسم المعروض</label><input id="display_name" name="display_name" required minLength={2} maxLength={60} defaultValue={profile?.display_name ?? ""} className="w-full rounded-lg border p-2" /></div>
        <div><label htmlFor="username" className="mb-1 block text-sm font-medium">اسم المستخدم</label><input id="username" name="username" required minLength={3} maxLength={30} defaultValue={username} className="w-full rounded-lg border p-2" /></div>
      </div>
      <div><label htmlFor="profile_tagline" className="mb-1 block text-sm font-medium">جملة صغيرة تحت اسمك</label><input id="profile_tagline" name="profile_tagline" maxLength={120} defaultValue={profile?.profile_tagline ?? ""} className="w-full rounded-lg border p-2" /><p className="mt-1 text-xs text-stone-600">مثال: بحب الحاجات اللي ليها قصة.</p></div>
      <div className="grid gap-3 sm:grid-cols-2"><div><label htmlFor="city" className="mb-1 block text-sm font-medium">المدينة</label><input id="city" name="city" maxLength={60} defaultValue={profile?.city ?? ""} className="w-full rounded-lg border p-2" /></div><div><label htmlFor="area" className="mb-1 block text-sm font-medium">المنطقة</label><input id="area" name="area" maxLength={60} defaultValue={profile?.area ?? ""} className="w-full rounded-lg border p-2" /></div></div>
      <div><label htmlFor="bio" className="mb-1 block text-sm font-medium">نبذة قصيرة</label><textarea id="bio" name="bio" maxLength={200} defaultValue={profile?.bio ?? ""} className="h-24 w-full rounded-lg border p-2" /></div>
      <div><label htmlFor="interests" className="mb-1 block text-sm font-medium">اهتماماتك</label><input id="interests" name="interests" maxLength={180} defaultValue={profile?.interests ?? ""} className="w-full rounded-lg border p-2" /><p className="mt-1 text-xs text-stone-600">مثال: كتب، كاميرات، ديكور، لبس.</p></div>
      <div><label htmlFor="preferred_categories" className="mb-1 block text-sm font-medium">الفئات المفضلة</label><input id="preferred_categories" name="preferred_categories" maxLength={180} defaultValue={profile?.preferred_categories ?? ""} className="w-full rounded-lg border p-2" /></div>
      <div><label htmlFor="swap_preferences" className="mb-1 block text-sm font-medium">بتحب تبدّل إيه غالبًا؟</label><textarea id="swap_preferences" name="swap_preferences" maxLength={240} defaultValue={profile?.swap_preferences ?? ""} className="h-24 w-full rounded-lg border p-2" /><p className="mt-1 text-xs text-stone-600">اكتبها بطريقتك، دي بتساعد الناس تعرف إيه المناسب لك.</p></div>
      <button className="rounded-xl bg-clay px-5 py-2.5 text-white">احفظ البروفايل</button>
    </form>

    {username ? <Link href={`/users/${username}`} className="inline-flex rounded-xl border px-4 py-2">شوف شكل بروفايلك للناس</Link> : null}
  </section>;
}
