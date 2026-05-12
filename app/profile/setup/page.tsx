import { redirect } from "next/navigation";
import { completeProfileSetup } from "./actions";
import { normalizeNextPath } from "@/lib/normalize-next-path";
import { createClient } from "@/lib/supabase/server";

type SetupPageParams = {
  searchParams?: Promise<{ next?: string; error?: string }>;
};

export default async function ProfileSetupPage({ searchParams }: SetupPageParams) {
  const query = (await searchParams) ?? {};
  const next = normalizeNextPath(query.next);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/profile/setup?next=${next}`)}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name,username,city,area,bio,profile_tagline")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.username?.trim()) {
    redirect(next);
  }

  return (
    <section className="mx-auto max-w-2xl space-y-5 px-4 py-10">
      <h1 className="text-3xl font-bold">خلّي الناس تعرف تتعامل معاك</h1>
      <p className="text-stone-700">البروفايل بيساعد الناس تعرف تتعامل مع مين. كمّله في أقل من دقيقة.</p>
      {query.error ? <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-800">{query.error}</p> : null}

      <form action={completeProfileSetup} className="space-y-4 rounded-2xl border bg-white p-5">
        <input type="hidden" name="next" value={next} />
        <div>
          <label htmlFor="display_name" className="mb-1 block text-sm font-medium">الاسم المعروض</label>
          <input id="display_name" name="display_name" required minLength={2} maxLength={60} defaultValue={profile?.display_name ?? ""} className="w-full rounded-lg border p-2" />
        </div>
        <div>
          <label htmlFor="username" className="mb-1 block text-sm font-medium">اسم المستخدم</label>
          <input id="username" name="username" required minLength={3} maxLength={30} defaultValue="" className="w-full rounded-lg border p-2" placeholder="مثال: ahmed_91" />
          <p className="mt-1 text-xs text-stone-600">ده هيبقى رابط صفحتك العامة، ومش هيتعرض إيميلك للناس.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="city" className="mb-1 block text-sm font-medium">المدينة (اختياري)</label>
            <input id="city" name="city" maxLength={60} defaultValue={profile?.city ?? ""} className="w-full rounded-lg border p-2" />
          </div>
          <div>
            <label htmlFor="area" className="mb-1 block text-sm font-medium">المنطقة (اختياري)</label>
            <input id="area" name="area" maxLength={60} defaultValue={profile?.area ?? ""} className="w-full rounded-lg border p-2" />
          </div>
        </div>
        <div>
          <label htmlFor="profile_tagline" className="mb-1 block text-sm font-medium">جملة صغيرة تحت اسمك (اختياري)</label>
          <input id="profile_tagline" name="profile_tagline" maxLength={120} defaultValue={profile?.profile_tagline ?? ""} className="w-full rounded-lg border p-2" />
        </div>
        <div>
          <label htmlFor="bio" className="mb-1 block text-sm font-medium">نبذة قصيرة (اختياري)</label>
          <textarea id="bio" name="bio" maxLength={200} defaultValue={profile?.bio ?? ""} className="h-24 w-full rounded-lg border p-2" />
        </div>
        <button className="rounded-xl bg-clay px-5 py-2.5 text-white">ابدأ ببروفايلك</button>
      </form>
    </section>
  );
}
