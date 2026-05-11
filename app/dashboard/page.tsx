import Link from "next/link";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { isCurrentUserAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

type OfferStatus = "pending" | "thinking" | "accepted";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  const [
    { data: profile },
    { count: activeItemsCount },
    { data: receivedOffers },
    { data: sentOffers },
    { count: dealsCount },
    { count: completedDealsCount },
    { count: pendingConfirmationsCount },
    { count: unreadNotificationsCount },
    isAdmin,
  ] = await Promise.all([
    supabase.from("profiles").select("display_name,username,bio,city,area").eq("id", user.id).maybeSingle(),
    supabase.from("items").select("id", { count: "exact", head: true }).eq("owner_id", user.id).eq("status", "active"),
    supabase.from("offers").select("status").eq("receiver_id", user.id),
    supabase.from("offers").select("status").eq("sender_id", user.id),
    supabase.from("swap_deals").select("id", { count: "exact", head: true }).or(`requester_id.eq.${user.id},offerer_id.eq.${user.id}`),
    supabase.from("swap_deals").select("id", { count: "exact", head: true }).or(`requester_id.eq.${user.id},offerer_id.eq.${user.id}`).eq("status", "completed"),
    supabase.from("swap_deals").select("id", { count: "exact", head: true }).or(`requester_id.eq.${user.id},offerer_id.eq.${user.id}`).eq("status", "completed_pending_confirmation"),
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", user.id).is("read_at", null),
    isCurrentUserAdmin(supabase),
  ]);

  const received = (receivedOffers ?? []).map((offer) => offer.status as OfferStatus);
  const sent = (sentOffers ?? []).map((offer) => offer.status as OfferStatus);
  const username = profile?.username ?? null;
  const profileComplete = Boolean(username && profile?.city && profile?.area && profile?.bio);

  return (
    <PageShell title="حسابي">
      <div className="mb-4 space-y-2"><p className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-sm text-stone-700">ابدأ بعرض حاجة واضحة بصور حقيقية، وبعدها تابع العروض من حسابك.</p><Link href="/install" className="inline-flex rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-700">نزّل بدّلها على موبايلك</Link></div>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="space-y-2 rounded-xl border bg-white p-4"><p className="text-lg font-semibold">حسابي</p><p>{profile?.display_name ?? "مستخدم"}</p><p className="text-sm text-stone-600">{username ? `@${username}` : "لسه مكملش بياناته"}</p>{!profileComplete ? <p className="rounded-lg bg-amber-50 p-2 text-sm text-amber-900">كمّل بروفايلك عشان الناس تعرف تتعامل معاك بثقة.</p> : null}<Link href="/profile" className="inline-flex rounded-lg border px-3 py-1.5 text-sm">تعديل بروفايلك</Link></section>
        <section className="space-y-2 rounded-xl border bg-white p-4"><p className="text-lg font-semibold">حاجاتي</p><p className="text-2xl font-bold">{activeItemsCount ?? 0}</p><div className="flex gap-2"><Link href="/dashboard/items" className="rounded-lg border px-3 py-1.5 text-sm">إدارة حاجاتي</Link><Link href="/items/new" className="rounded-lg border px-3 py-1.5 text-sm">أضف حاجة جديدة</Link></div></section>
        <section className="space-y-2 rounded-xl border bg-white p-4"><p className="text-lg font-semibold">عروض وصلتني</p><p className="text-sm text-stone-700">إجمالي العروض: {received.length}</p><p className="text-sm text-stone-700">محتاج رد منك: {received.filter((status) => status === "pending" || status === "thinking").length}</p><Link href="/dashboard/offers/received" className="inline-flex rounded-lg border px-3 py-1.5 text-sm">افتح العروض</Link></section>
        <section className="space-y-2 rounded-xl border bg-white p-4"><p className="text-lg font-semibold">عروض بعتها</p><p className="text-sm text-stone-700">إجمالي العروض: {sent.length}</p><p className="text-sm text-stone-700">متابعة (pending/thinking/accepted): {sent.filter((status) => status === "accepted" || status === "thinking" || status === "pending").length}</p><Link href="/dashboard/offers/sent" className="inline-flex rounded-lg border px-3 py-1.5 text-sm">افتح العروض</Link></section>
        <section className="space-y-2 rounded-xl border bg-white p-4"><p className="text-lg font-semibold">الإشعارات</p><p className="text-2xl font-bold">{unreadNotificationsCount ?? 0}</p><p className="text-sm text-stone-700">غير مقروءة</p><Link href="/notifications" className="inline-flex rounded-lg border px-3 py-1.5 text-sm">افتح الإشعارات</Link></section>
        <section className="space-y-2 rounded-xl border bg-white p-4 md:col-span-2"><p className="text-lg font-semibold">صفقاتي</p><p className="text-2xl font-bold">{dealsCount ?? 0}</p><p className="text-sm text-stone-700">تمت: {completedDealsCount ?? 0}</p><p className="text-sm text-stone-700">مستنية تأكيد: {pendingConfirmationsCount ?? 0}</p><div className="flex gap-2"><Link href="/deals" className="inline-flex rounded-lg border px-3 py-1.5 text-sm">افتح الصفقات</Link><Link href="/dashboard/reports" className="inline-flex rounded-lg border px-3 py-1.5 text-sm">بلاغاتي</Link>{isAdmin ? <Link href="/admin/reports" className="inline-flex rounded-lg border px-3 py-1.5 text-sm">مراجعة البلاغات</Link> : null}</div></section>
      </div>
    </PageShell>
  );
}
