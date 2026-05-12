import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { updateReportStatus } from "@/app/admin/reports/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeading } from "@/components/ui/page-heading";
import { StatusBadge } from "@/components/ui/status-badge";
import { isCurrentUserAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

const STATUS_OPTIONS = ["all", "open", "reviewing", "resolved", "dismissed"] as const;
const REASON_OPTIONS = ["all", "misleading_item", "inappropriate_content", "spam_offer", "unsafe_behavior", "no_show", "other"] as const;

const statusLabels: Record<(typeof STATUS_OPTIONS)[number], string> = { all: "الكل", open: "مفتوح", reviewing: "تحت المراجعة", resolved: "اتحل", dismissed: "اتقفل" };
const reasonLabels: Record<(typeof REASON_OPTIONS)[number], string> = { all: "كل الأسباب", misleading_item: "إعلان مضلل", inappropriate_content: "محتوى غير مناسب", spam_offer: "عرض مزعج / سبام", unsafe_behavior: "تصرف غير آمن", no_show: "عدم حضور أو اتفاق فشل", other: "سبب آخر" };

type SearchParams = { status?: string; reason?: string; updated?: string; error?: string };

type ReportRow = { id: string; reason: string; status: string; details: string | null; created_at: string; item_id: string | null; offer_id: string | null; deal_id: string | null; deal_message_id: string | null; reporter_id: string; reported_user_id: string | null };

export default async function AdminReportsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const statusFilter = STATUS_OPTIONS.includes((params.status ?? "") as (typeof STATUS_OPTIONS)[number]) ? (params.status as (typeof STATUS_OPTIONS)[number]) : "all";
  const reasonFilter = REASON_OPTIONS.includes((params.reason ?? "") as (typeof REASON_OPTIONS)[number]) ? (params.reason as (typeof REASON_OPTIONS)[number]) : "all";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/reports");
  if (!(await isCurrentUserAdmin(supabase))) notFound();

  let query = supabase.from("reports").select("id,reason,status,details,created_at,item_id,offer_id,deal_id,deal_message_id,reporter_id,reported_user_id").order("created_at", { ascending: false });
  if (statusFilter !== "all") query = query.eq("status", statusFilter);
  if (reasonFilter !== "all") query = query.eq("reason", reasonFilter);

  const { data } = await query;
  const reports: ReportRow[] = data ?? [];

  const profileIds = Array.from(new Set(reports.flatMap((r) => [r.reporter_id, r.reported_user_id ?? ""]).filter(Boolean)));
  const { data: profiles } = profileIds.length ? await supabase.from("profiles").select("id,display_name,username").in("id", profileIds) : { data: [] };
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  const messageIds = reports.map((r) => r.deal_message_id).filter((id): id is string => Boolean(id));
  const { data: messageRows } = messageIds.length
    ? await supabase.from("deal_messages").select("id,body,sender_id").in("id", messageIds)
    : { data: [] };
  const messageMap = new Map((messageRows ?? []).map((m) => [m.id, m]));


  return (
    <section className="mx-auto max-w-5xl space-y-4 px-4 py-10">
      <PageHeading title="مراجعة البلاغات" subtitle="البلاغات دي خاصة بالإدارة فقط. راجع التفاصيل بهدوء وغيّر الحالة حسب المتابعة." />
      <Alert>البلاغات للتشغيل والمراجعة اليدوية. لو محتاج تفاصيل تجربة المستخدم، راجع Feedback البيتا. <Link href="/admin/feedback" className="underline">افتح Feedback البيتا</Link></Alert>
      {params.updated === "1" ? <Alert variant="success">تم تحديث حالة البلاغ.</Alert> : null}
      {params.error === "update_failed" ? <Alert variant="danger">مش قادرين نحدّث البلاغ دلوقتي.</Alert> : null}

      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((status) => {
          const search = new URLSearchParams();
          if (status !== "all") search.set("status", status);
          if (reasonFilter !== "all") search.set("reason", reasonFilter);
          return <Link key={status} href={{ pathname: "/admin/reports", query: Object.fromEntries(search.entries()) }} className={`rounded-lg border px-3 py-1.5 text-sm ${status === statusFilter ? "bg-stone-900 text-white" : "bg-white"}`}>{statusLabels[status]}</Link>;
        })}
      </div>

      <form className="flex items-center gap-2" method="get">
        <input type="hidden" name="status" value={statusFilter} />
        <label htmlFor="reason" className="text-sm">السبب:</label>
        <select id="reason" name="reason" defaultValue={reasonFilter} className="rounded-lg border px-3 py-2 text-sm">
          {REASON_OPTIONS.map((reason) => <option key={reason} value={reason}>{reasonLabels[reason]}</option>)}
        </select>
        <Button type="submit" variant="secondary" size="sm">تصفية</Button>
      </form>

      {reports.length === 0 ? <EmptyState title="مفيش بلاغات مطابقة." subtitle="جرّب تغيّر الفلاتر." /> : reports.map((report) => {
        const reporter = profileMap.get(report.reporter_id);
        const reportedUser = report.reported_user_id ? profileMap.get(report.reported_user_id) : null;
        return (
          <Card key={report.id} className="space-y-2"><CardContent>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <StatusBadge variant="muted">{reasonLabels[report.reason as (typeof REASON_OPTIONS)[number]] ?? report.reason}</StatusBadge>
              <StatusBadge variant="warning">{statusLabels[report.status as (typeof STATUS_OPTIONS)[number]] ?? report.status}</StatusBadge>
              <span className="text-stone-600">{new Date(report.created_at).toLocaleDateString("ar-EG")}</span>
            </div>
            {report.details ? <p className="text-sm text-stone-700">{report.details.slice(0, 240)}</p> : null}
            <div className="text-sm text-stone-700">
              <p>المبلّغ: {reporter?.display_name ?? reporter?.username ?? "غير متاح"}</p>
              <p>المبلّغ عنه: {reportedUser?.display_name ?? reportedUser?.username ?? "غير متاح"}</p>
              {report.deal_message_id ? (() => { const message = messageMap.get(report.deal_message_id); const sender = message ? profileMap.get(message.sender_id) : null; return <><p>الهدف: رسالة في صفقة</p><p>النص: {message ? message.body.slice(0, 120) : "الرسالة مش متاحة"}</p>{sender ? <p>المرسل: {sender.display_name ?? sender.username ?? "غير متاح"}</p> : null}</>; })() : null}
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              {report.item_id ? <Link href={`/items/${report.item_id}`} className="underline">فتح الإعلان</Link> : null}
              {report.offer_id ? <Link href={`/offers/${report.offer_id}`} className="underline">فتح العرض</Link> : null}
              {report.deal_id ? <Link href={`/deals/${report.deal_id}`} className="underline">فتح الصفقة</Link> : null}
              {report.deal_message_id ? <span className="text-stone-700">رسالة في صفقة</span> : null}
              {reportedUser?.username ? <Link href={`/users/${reportedUser.username}`} className="underline">فتح المستخدم</Link> : null}
              {!report.item_id && !report.offer_id && !report.deal_id && !reportedUser?.username ? <span className="text-stone-500">الهدف مش متاح</span> : null}
            </div>
            <form action={updateReportStatus} className="flex flex-wrap items-center gap-2">
              <input type="hidden" name="report_id" value={report.id} />
              <input type="hidden" name="status_filter" value={statusFilter} />
              <input type="hidden" name="reason_filter" value={reasonFilter} />
              <select name="status" defaultValue={report.status} className="rounded-lg border px-2 py-1 text-sm">
                {STATUS_OPTIONS.filter((status) => status !== "all").map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
              </select>
              <Button type="submit" variant="secondary" size="sm">حدّث الحالة</Button>
            </form>
          </CardContent></Card>
        );
      })}
    </section>
  );
}
