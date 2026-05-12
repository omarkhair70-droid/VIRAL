import Link from "next/link";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { Alert } from "@/components/ui/alert";
import { AppIcon, type AppIconName } from "@/components/ui/app-icon";
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

type Tone = "active" | "warning" | "success" | "muted";

const notificationVisuals: Record<NotificationType, { label: string; icon: AppIconName; tone: Tone }> = {
  offer_received: { label: "عرض جديد", icon: "offer", tone: "active" },
  offer_thinking: { label: "محتاج تفكير", icon: "clock", tone: "muted" },
  offer_accepted: { label: "عرض اتقبل", icon: "check", tone: "success" },
  offer_soft_rejected: { label: "العرض ما ظبطش", icon: "warning", tone: "warning" },
  offer_redirected: { label: "باب تاني", icon: "forward", tone: "active" },
  deal_created: { label: "صفقة جديدة", icon: "deal", tone: "active" },
  deal_completed: { label: "مقايضة تمت", icon: "check", tone: "success" },
  deal_cancelled: { label: "صفقة اتلغت", icon: "warning", tone: "warning" },
  report_update: { label: "تحديث بلاغ", icon: "report", tone: "muted" },
  system: { label: "تنبيه من النظام", icon: "bell", tone: "muted" },
};

const timelineToneStyles: Record<Tone, string> = {
  active: "bg-clay/10 text-clayDark ring-clay/25",
  warning: "bg-warningSoft text-amber-900 ring-amber-200",
  success: "bg-successSoft text-emerald-900 ring-emerald-200",
  muted: "bg-stone-100 text-stone-700 ring-stone-200",
};

function getTargetLink(notification: NotificationRow): Route | null {
  if (notification.deal_id) return `/deals/${notification.deal_id}` as Route;
  if (notification.offer_id) return `/offers/${notification.offer_id}` as Route;
  if (notification.item_id) return `/items/${notification.item_id}` as Route;
  return null;
}

function getDateBucket(createdAt: string): "النهارده" | "امبارح" | "أقدم" {
  const createdDate = new Date(createdAt);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfCreated = new Date(createdDate.getFullYear(), createdDate.getMonth(), createdDate.getDate());
  const daysDiff = Math.round((startOfToday.getTime() - startOfCreated.getTime()) / 86400000);

  if (daysDiff <= 0) return "النهارده";
  if (daysDiff === 1) return "امبارح";
  return "أقدم";
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

  const groupedNotifications = notifications.reduce<Record<"النهارده" | "امبارح" | "أقدم", NotificationRow[]>>(
    (acc, notification) => {
      const bucket = getDateBucket(notification.created_at);
      acc[bucket].push(notification);
      return acc;
    },
    { النهارده: [], امبارح: [], أقدم: [] },
  );

  const orderedGroups: Array<["النهارده" | "امبارح" | "أقدم", NotificationRow[]]> = [
    ["النهارده", groupedNotifications.النهارده],
    ["امبارح", groupedNotifications.امبارح],
    ["أقدم", groupedNotifications.أقدم],
  ];

  return (
    <PageShell title="الإشعارات">
      <PageHeading title="الإشعارات" subtitle="الإشعارات بتجمع عروضك وصفقاتك وبلاغاتك، لكنها مش Push Notifications لسه." />
      {query.updated === "read_all" ? <Alert variant="success" className="mb-4">تم تعليم كل الإشعارات كمقروءة.</Alert> : null}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/notifications" className={`rounded-lg px-3 py-1.5 text-sm ${filter === "all" ? "bg-clay text-white" : "border"}`}>الكل</Link>
          <Link href="/notifications?filter=unread" className={`rounded-lg px-3 py-1.5 text-sm ${filter === "unread" ? "bg-clay text-white" : "border"}`}>غير مقروءة</Link>
          {unreadCount > 0 ? <span className="text-sm text-stone-600">{unreadCount} غير مقروءة</span> : null}
        </div>
        {unreadCount > 0 ? (
          <form action={markAllNotificationsRead}>
            <Button variant="secondary" size="sm">علّم الكل كمقروء</Button>
          </form>
        ) : null}
      </div>

      {notifications.length === 0 ? (
        <EmptyState iconName="bell" title={filter === "unread" ? "مفيش جديد دلوقتي." : "لسه مفيش إشعارات."} subtitle={filter === "all" ? "لما يوصلك عرض أو يحصل تحديث مهم، هيظهر هنا." : "جرّب تبدّل على كل الإشعارات."} />
      ) : (
        <div className="space-y-6">
          {orderedGroups.map(([groupLabel, groupNotifications]) => {
            if (groupNotifications.length === 0) return null;

            return (
              <section key={groupLabel} className="space-y-3">
                <h2 className="text-sm font-semibold text-stone-600">{groupLabel}</h2>
                <div className="space-y-3">
                  {groupNotifications.map((notification, index) => {
                    const targetLink = getTargetLink(notification);
                    const visuals = notificationVisuals[notification.type];
                    const isUnread = !notification.read_at;

                    return (
                      <div key={notification.id} className="relative ps-11">
                        {index < groupNotifications.length - 1 ? <span aria-hidden className="absolute end-[calc(100%-18px)] top-12 h-[calc(100%-26px)] w-px bg-stone-200" /> : null}
                        <span
                          className={`absolute end-[calc(100%-26px)] top-5 inline-flex h-7 w-7 items-center justify-center rounded-full ring-1 ${timelineToneStyles[visuals.tone]} ${isUnread ? "shadow-sm" : "opacity-80"}`}
                          aria-hidden
                        >
                          <AppIcon name={visuals.icon} className="h-4 w-4" />
                        </span>
                        <Card className={isUnread ? "border-clay/45 bg-clay/5" : "border-warmBorder bg-white"}>
                          <CardContent>
                            <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-ink">{notification.title}</span>
                                {isUnread ? <span className="inline-flex h-2.5 w-2.5 rounded-full bg-clay" aria-label="غير مقروء" /> : null}
                              </div>
                              <StatusBadge variant={visuals.tone}>{visuals.label}</StatusBadge>
                            </div>
                            {notification.body ? <p className="text-sm text-stone-700">{notification.body}</p> : null}
                            <p className="mt-2 text-xs text-stone-500">{new Date(notification.created_at).toLocaleString("ar-EG")}</p>
                            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                              {targetLink ? (
                                <Link href={targetLink} className="text-sm font-medium text-clay hover:underline">افتح</Link>
                              ) : (
                                <span className="text-sm text-stone-500">التفاصيل مش متاحة دلوقتي</span>
                              )}
                              {isUnread ? (
                                <form action={markNotificationRead}>
                                  <input type="hidden" name="notification_id" value={notification.id} />
                                  <input type="hidden" name="filter" value={filter} />
                                  <button className="text-sm text-stone-700 underline">علّم كمقروء</button>
                                </form>
                              ) : null}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
