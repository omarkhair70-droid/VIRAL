import Link from "next/link";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeading } from "@/components/ui/page-heading";
import { StatusBadge } from "@/components/ui/status-badge";
import { createClient } from "@/lib/supabase/server";
import { markAllNotificationsRead, markNotificationRead } from "./actions";

type NotificationType = "offer_received" | "offer_thinking" | "offer_accepted" | "offer_soft_rejected" | "offer_redirected" | "deal_created" | "deal_completed" | "deal_cancelled" | "report_update" | "system";

type NotificationRow = {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  item_id: string | null;
  offer_id: string | null;
  deal_id: string | null;
  read_at: string | null;
  created_at: string;
};

const typeLabels: Record<NotificationType, string> = {
  offer_received: "عرض جديد",
  offer_thinking: "محتاج تفكير",
  offer_accepted: "عرض اتقبل",
  offer_soft_rejected: "العرض ما ظبطش",
  offer_redirected: "باب تاني",
  deal_created: "صفقة جديدة",
  deal_completed: "مقايضة تمت",
  deal_cancelled: "صفقة اتلغت",
  report_update: "تحديث بلاغ",
  system: "تنبيه من النظام",
};

function getTargetLink(notification: NotificationRow): Route | null {
  if (notification.deal_id) return `/deals/${notification.deal_id}` as Route;
  if (notification.offer_id) return `/offers/${notification.offer_id}` as Route;
  if (notification.item_id) return `/items/${notification.item_id}` as Route;
  return null;
}

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams?: Promise<{ filter?: string; updated?: string }>;
}) {
  const query = (await searchParams) ?? {};
  const filter = query.filter === "unread" ? "unread" : "all";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/notifications");

  const queryBuilder = supabase
    .from("notifications")
    .select("id,type,title,body,item_id,offer_id,deal_id,read_at,created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  const { data } = filter === "unread" ? await queryBuilder.is("read_at", null) : await queryBuilder;
  const notifications = (data ?? []) as NotificationRow[];
  const unreadCount = notifications.filter((notification) => !notification.read_at).length;

  return (
    <PageShell title="الإشعارات">
      <PageHeading title="الإشعارات" subtitle="كل التحديثات المهمة عن عروضك وصفقاتك وبلاغاتك في مكان واحد." />
      {query.updated === "read_all" ? <Alert variant="success" className="mb-4">تم تعليم كل الإشعارات كمقروءة.</Alert> : null}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link href="/notifications" className={`rounded-lg px-3 py-1.5 text-sm ${filter === "all" ? "bg-clay text-white" : "border"}`}>الكل</Link>
          <Link href="/notifications?filter=unread" className={`rounded-lg px-3 py-1.5 text-sm ${filter === "unread" ? "bg-clay text-white" : "border"}`}>غير مقروءة</Link>
        </div>
        {unreadCount > 0 ? (
          <form action={markAllNotificationsRead}>
            <Button variant="secondary" size="sm">علّم الكل كمقروء</Button>
          </form>
        ) : null}
      </div>

      {notifications.length === 0 ? (
        <EmptyState title={filter === "unread" ? "مفيش إشعارات جديدة." : "لسه مفيش إشعارات."} subtitle={filter === "all" ? "لما يوصلك عرض أو يحصل تحديث مهم، هيظهر هنا." : "جرّب تبدّل على كل الإشعارات."} />
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const targetLink = getTargetLink(notification);
            return (
              <Card key={notification.id} className={!notification.read_at ? "border-amber-300" : ""}>
                <CardContent>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {!notification.read_at ? <span className="inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" aria-label="غير مقروء" /> : null}
                    <p className="font-semibold">{notification.title}</p>
                  </div>
                  <StatusBadge variant="muted">{typeLabels[notification.type]}</StatusBadge>
                </div>
                {notification.body ? <p className="text-sm text-stone-700">{notification.body}</p> : null}
                <p className="mt-2 text-xs text-stone-500">{new Date(notification.created_at).toLocaleString("ar-EG")}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {targetLink ? <Link href={targetLink} className="text-sm text-clay hover:underline">افتح</Link> : <span className="text-sm text-stone-500">التفاصيل مش متاحة دلوقتي</span>}
                  {!notification.read_at ? (
                    <form action={markNotificationRead}>
                      <input type="hidden" name="notification_id" value={notification.id} />
                      <input type="hidden" name="filter" value={filter} />
                      <button className="text-sm text-stone-700 underline">علّم كمقروء</button>
                    </form>
                  ) : null}
                </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
