import Link from "next/link";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { Alert } from "@/components/ui/alert";
import { AppIcon } from "@/components/ui/app-icon";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeading } from "@/components/ui/page-heading";
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
    supabase
      .from("swap_deals")
      .select("id", { count: "exact", head: true })
      .or(`requester_id.eq.${user.id},offerer_id.eq.${user.id}`)
      .eq("status", "completed_pending_confirmation"),
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", user.id).is("read_at", null),
    isCurrentUserAdmin(supabase),
  ]);

  const received = (receivedOffers ?? []).map((offer) => offer.status as OfferStatus);
  const sent = (sentOffers ?? []).map((offer) => offer.status as OfferStatus);
  const username = profile?.username ?? null;
  const profileComplete = Boolean(username && profile?.city && profile?.area && profile?.bio);

  const receivedNeedsResponseCount = received.filter((status) => status === "pending" || status === "thinking").length;
  const sentFollowupCount = sent.filter((status) => status === "accepted" || status === "thinking" || status === "pending").length;

  const attentionItems = [
    {
      key: "offers",
      title: "عروض محتاجة رد",
      count: receivedNeedsResponseCount,
      note: "راجع العروض اللي لسه محتاجة قرار.",
      href: "/dashboard/offers/received" as const,
      cta: "افتح العروض",
      icon: "offer" as const,
    },
    {
      key: "deals",
      title: "صفقات مستنية تأكيد",
      count: pendingConfirmationsCount ?? 0,
      note: "في صفقات حالتها مستنية تأكيد.",
      href: "/deals" as const,
      cta: "افتح الصفقات",
      icon: "deal" as const,
    },
    {
      key: "notifications",
      title: "إشعارات غير مقروءة",
      count: unreadNotificationsCount ?? 0,
      note: "تابع آخر التحديثات من الإشعارات.",
      href: "/notifications" as const,
      cta: "افتح الإشعارات",
      icon: "bell" as const,
    },
  ];
  const urgentAttentionItems = attentionItems.filter((item) => item.count > 0);

  return (
    <PageShell title="حسابي">
      <PageHeading title="حسابي" subtitle="مركز حسابك: راجع المهم دلوقتي، تابع نشاطك، وعدّل بروفايلك." />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Attention Now</h2>
        {urgentAttentionItems.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-3">
            {urgentAttentionItems.map((item) => (
              <Card key={item.key}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <AppIcon name={item.icon} className="h-4 w-4" />
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <p className="text-2xl font-bold">{item.count}</p>
                  <p className="text-sm text-stone-600">{item.note}</p>
                </CardContent>
                <CardFooter>
                  <ButtonLink href={item.href} variant="secondary" size="sm">
                    {item.cta}
                  </ButtonLink>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-stone-700">مفيش حاجة مستعجلة دلوقتي.</p>
              <ButtonLink href="/" variant="secondary" size="sm">
                شوف السوق
              </ButtonLink>
            </CardContent>
          </Card>
        )}
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="text-xl font-semibold">My Swap Activity</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><AppIcon name="publish" className="h-4 w-4" />حاجاتي</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-2xl font-bold">{activeItemsCount ?? 0}</p>
              <p className="text-sm text-stone-700">حاجات فعّالة حالياً.</p>
            </CardContent>
            <CardFooter className="flex gap-2">
              <ButtonLink href="/dashboard/items" variant="secondary" size="sm">إدارة حاجاتي</ButtonLink>
              <ButtonLink href="/items/new" variant="secondary" size="sm">أضف حاجة جديدة</ButtonLink>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><AppIcon name="offer" className="h-4 w-4" />عروض وصلتني</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-stone-700">
              <p>إجمالي العروض: {received.length}</p>
              <p>محتاجة رد: {receivedNeedsResponseCount}</p>
            </CardContent>
            <CardFooter>
              <ButtonLink href="/dashboard/offers/received" variant="secondary" size="sm">افتح العروض</ButtonLink>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><AppIcon name="offer" className="h-4 w-4" />عروض بعتها</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-stone-700">
              <p>إجمالي العروض: {sent.length}</p>
              <p>متابعة (pending/thinking/accepted): {sentFollowupCount}</p>
            </CardContent>
            <CardFooter>
              <ButtonLink href="/dashboard/offers/sent" variant="secondary" size="sm">افتح العروض</ButtonLink>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><AppIcon name="deal" className="h-4 w-4" />صفقاتي</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-stone-700">
              <p>إجمالي الصفقات: {dealsCount ?? 0}</p>
              <p>تمت: {completedDealsCount ?? 0}</p>
              <p>مستنية تأكيد: {pendingConfirmationsCount ?? 0}</p>
            </CardContent>
            <CardFooter>
              <ButtonLink href="/deals" variant="secondary" size="sm">افتح الصفقات</ButtonLink>
            </CardFooter>
          </Card>
        </div>
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="text-xl font-semibold">My Account & Trust</h2>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><AppIcon name="profile" className="h-4 w-4" />بيانات الحساب</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="font-medium">{profile?.display_name ?? "مستخدم"}</p>
            <p className="text-sm text-stone-600">{username ? `@${username}` : "لسه مكملش بياناته"}</p>
            {!profileComplete ? <Alert variant="warning">كمّل بروفايلك عشان الناس تعرف تتعامل معاك بثقة.</Alert> : null}
          </CardContent>
          <CardFooter className="flex gap-2">
            <ButtonLink href="/profile" variant="secondary" size="sm">تعديل بروفايلك</ButtonLink>
            {username ? (
              <Link href={`/users/${username}`} className="inline-flex rounded-lg border px-3 py-1.5 text-sm">
                شوف بروفايلك العام
              </Link>
            ) : null}
          </CardFooter>
        </Card>
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="text-xl font-semibold">Support & Utilities</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">الدعم والمتابعة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-stone-700">
              <p>لو قابلتك مشكلة أو محتاج تبعت رأي، كل الروابط هنا.</p>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2">
              <Link href="/feedback" className="inline-flex rounded-lg border px-3 py-1.5 text-sm">ابعت رأيك</Link>
              <Link href="/dashboard/feedback" className="inline-flex rounded-lg border px-3 py-1.5 text-sm">شوف feedback اللي بعته</Link>
              <Link href="/dashboard/reports" className="inline-flex rounded-lg border px-3 py-1.5 text-sm">بلاغاتي</Link>
              {isAdmin ? <Link href="/admin/reports" className="inline-flex rounded-lg border px-3 py-1.5 text-sm">مراجعة البلاغات</Link> : null}
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">أدوات الحساب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-stone-700">
              <p>استخدم بدّلها من موبايلك بسهولة.</p>
            </CardContent>
            <CardFooter>
              <ButtonLink href="/install" variant="secondary" size="sm">نزّل بدّلها على موبايلك</ButtonLink>
            </CardFooter>
          </Card>
        </div>
      </section>
    </PageShell>
  );
}
