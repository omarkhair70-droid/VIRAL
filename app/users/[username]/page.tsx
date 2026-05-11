import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type ProfileRow = {
  id: string;
  display_name: string;
  username: string | null;
  bio: string | null;
  city: string | null;
  area: string | null;
  created_at: string;
  successful_swaps_count: number;
};

type ReviewRow = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer: { display_name: string | null; username: string | null }[] | null;
};

export default async function UserProfilePage({ params, searchParams }: { params: Promise<{ username: string }>; searchParams?: Promise<{ reported?: string }> }) {
  const { username } = await params;
  const query = (await searchParams) ?? {};
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,display_name,username,bio,city,area,created_at,successful_swaps_count")
    .eq("username", username.toLowerCase())
    .maybeSingle();

  if (!profile) notFound();

  const typed = profile as ProfileRow;

  const [{ data: items }, { count: dealsCount }, { data: reviewsData }] = await Promise.all([
    supabase
      .from("items")
      .select("id,title,city,area,created_at")
      .eq("owner_id", typed.id)
      .eq("status", "active")
      .order("created_at", { ascending: false }),
    supabase
      .from("swap_deals")
      .select("id", { count: "exact", head: true })
      .or(`requester_id.eq.${typed.id},offerer_id.eq.${typed.id}`),
    supabase
      .from("reviews")
      .select("id,rating,comment,created_at,reviewer:profiles!reviews_reviewer_id_fkey(display_name,username)")
      .eq("reviewee_id", typed.id)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const latestReviews = (reviewsData as ReviewRow[] | null) ?? [];
  const { data: avgRows } = await supabase.from("reviews").select("rating").eq("reviewee_id", typed.id);
  const reviewCount = avgRows?.length ?? 0;
  const averageRating = reviewCount > 0 ? (avgRows ?? []).reduce((sum, review) => sum + review.rating, 0) / reviewCount : null;

  return (
    <section className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      <div className="rounded-2xl border bg-white p-5">
        <h1 className="text-3xl font-bold">{typed.display_name}</h1>
        <p className="mt-1 text-stone-600">@{typed.username}</p>
        <p className="mt-2 text-sm text-stone-600">{[typed.city, typed.area].filter(Boolean).join(" - ") || "لسه مكملش بياناته"}</p>
        {typed.bio ? <p className="mt-3 text-stone-700">{typed.bio}</p> : null}
        <p className="mt-3 text-xs text-stone-500">عضو من {new Date(typed.created_at).toLocaleDateString("ar-EG")}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border bg-stone-50 p-4"><p className="text-sm text-stone-600">حاجاته المعروضة</p><p className="text-2xl font-bold">{items?.length ?? 0}</p></div>
        <div className="rounded-xl border bg-stone-50 p-4"><p className="text-sm text-stone-600">صفقات مقبولة</p><p className="text-2xl font-bold">{dealsCount ?? 0}</p></div>
        <div className="rounded-xl border bg-stone-50 p-4"><p className="text-sm text-stone-600">مقايضات ناجحة</p><p className="text-2xl font-bold">{typed.successful_swaps_count}</p></div>
        <div className="rounded-xl border bg-stone-50 p-4"><p className="text-sm text-stone-600">متوسط التقييم</p><p className="text-2xl font-bold">{averageRating ? averageRating.toFixed(1) : "-"}</p><p className="text-xs text-stone-500">{reviewCount} تقييم</p></div>
      </div>

      {query.reported === "1" ? <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-800">تم إرسال البلاغ. شكرًا إنك ساعدتنا نحافظ على التجربة.</p> : null}
      <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900">اتعامل بهدوء، وافحص الحاجة قبل المقايضة.</p>
      {user && user.id !== typed.id ? <Link href={`/report?username=${encodeURIComponent(username)}&returnTo=${encodeURIComponent(`/users/${username}`)}`} className="inline-block text-sm text-stone-600 hover:underline">بلّغ عن المستخدم</Link> : null}

      <div className="space-y-3">
        <h2 className="text-xl font-semibold">آراء الناس بعد المقايضة</h2>
        {latestReviews.length ? (
          <div className="space-y-3">
            {latestReviews.map((review) => {
              const reviewer = review.reviewer?.[0];
              const reviewerName = reviewer?.display_name ?? "مستخدم";
              return (
                <article key={review.id} className="rounded-xl border bg-white p-4">
                  <p className="text-sm text-stone-500">{new Date(review.created_at).toLocaleDateString("ar-EG")}</p>
                  <p className="font-semibold">{reviewerName} • {review.rating}/5</p>
                  {review.comment ? <p className="mt-1 text-sm text-stone-700">{review.comment}</p> : null}
                </article>
              );
            })}
          </div>
        ) : (
          <p className="rounded-xl border bg-white p-4 text-stone-600">لسه مفيش تقييمات.</p>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-semibold">حاجاته</h2>
        {items?.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {items.map((item) => (
              <Link key={item.id} href={`/items/${item.id}`} className="rounded-xl border bg-white p-4">
                <p className="font-semibold">{item.title}</p>
                <p className="mt-1 text-sm text-stone-600">{[item.city, item.area].filter(Boolean).join(" - ") || "بدون موقع"}</p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border bg-white p-4 text-stone-600">لسه مفيش حاجات معروضة.</p>
        )}
      </div>
    </section>
  );
}
