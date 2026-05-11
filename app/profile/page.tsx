import Link from "next/link";
import { redirect } from "next/navigation";
import { updateProfile } from "./actions";
import { createClient } from "@/lib/supabase/server";

type PageParams = {
  searchParams?: Promise<{ updated?: string; error?: string }>;
};

export default async function ProfilePage({ searchParams }: PageParams) {
  const query = (await searchParams) ?? {};
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/profile");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name,username,city,area,bio,avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const username = profile?.username ?? "";

  return (
    <section className="mx-auto max-w-2xl space-y-5 px-4 py-10">
      <h1 className="text-3xl font-bold">بروفايلك</h1>
      <p className="text-sm text-stone-600">البروفايل الواضح بيساعد الناس تتعامل معاك بثقة.</p>
      {query.updated ? <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-800">تم تحديث بروفايلك بنجاح.</p> : null}
      {query.error ? <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-800">{query.error}</p> : null}

      <form action={updateProfile} className="space-y-4 rounded-2xl border bg-white p-5">
        <div>
          <label htmlFor="display_name" className="mb-1 block text-sm font-medium">الاسم المعروض</label>
          <input id="display_name" name="display_name" required minLength={2} maxLength={60} defaultValue={profile?.display_name ?? ""} className="w-full rounded-lg border p-2" />
        </div>
        <div>
          <label htmlFor="username" className="mb-1 block text-sm font-medium">اسم المستخدم</label>
          <input id="username" name="username" required minLength={3} maxLength={30} defaultValue={username} className="w-full rounded-lg border p-2" placeholder="مثال: ahmed_91" />
          <p className="mt-1 text-xs text-stone-600">حروف صغيرة + أرقام + _ أو -</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="city" className="mb-1 block text-sm font-medium">المدينة</label>
            <input id="city" name="city" maxLength={60} defaultValue={profile?.city ?? ""} className="w-full rounded-lg border p-2" />
          </div>
          <div>
            <label htmlFor="area" className="mb-1 block text-sm font-medium">المنطقة</label>
            <input id="area" name="area" maxLength={60} defaultValue={profile?.area ?? ""} className="w-full rounded-lg border p-2" />
          </div>
        </div>
        <div>
          <label htmlFor="bio" className="mb-1 block text-sm font-medium">نبذة قصيرة</label>
          <textarea id="bio" name="bio" maxLength={200} defaultValue={profile?.bio ?? ""} className="h-24 w-full rounded-lg border p-2" />
        </div>
        <div>
          <label htmlFor="avatar_url" className="mb-1 block text-sm font-medium">رابط الصورة</label>
          <input id="avatar_url" name="avatar_url" maxLength={500} defaultValue={profile?.avatar_url ?? ""} className="w-full rounded-lg border p-2" placeholder="https://..." />
        </div>
        <button className="rounded-xl bg-clay px-5 py-2.5 text-white">احفظ بروفايلك</button>
      </form>

      {username ? (
        <Link href={`/users/${username}`} className="inline-flex rounded-xl border px-4 py-2">افتح صفحتي العامة</Link>
      ) : (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900">كمّل بروفايلك عشان الناس تعرف تتعامل معاك بثقة.</p>
      )}
    </section>
  );
}
