import { notFound, redirect } from "next/navigation";
import { updateFeedbackStatus } from "@/app/admin/feedback/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeading } from "@/components/ui/page-heading";
import { StatusBadge } from "@/components/ui/status-badge";
import { isCurrentUserAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

const STATUS_OPTIONS = ["all", "new", "reviewed", "planned", "dismissed"] as const;
const TYPE_OPTIONS = ["all", "bug", "idea", "confusion", "praise", "other"] as const;

type SearchParams = { status?: string; type?: string; updated?: string; error?: string };

export default async function AdminFeedbackPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const statusFilter = STATUS_OPTIONS.includes((params.status ?? "") as (typeof STATUS_OPTIONS)[number]) ? params.status ?? "all" : "all";
  const typeFilter = TYPE_OPTIONS.includes((params.type ?? "") as (typeof TYPE_OPTIONS)[number]) ? params.type ?? "all" : "all";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/feedback");
  if (!(await isCurrentUserAdmin(supabase))) notFound();

  let query = supabase.from("feedback").select("id,feedback_type,status,subject,details,page_path,admin_note,created_at").order("created_at", { ascending: false });
  if (statusFilter !== "all") query = query.eq("status", statusFilter);
  if (typeFilter !== "all") query = query.eq("feedback_type", typeFilter);
  const { data } = await query;
  const rows = data ?? [];

  return (
    <section className="mx-auto max-w-5xl space-y-4 px-4 py-10">
      <PageHeading title="Feedback البيتا" subtitle="مراجعة ملاحظات المستخدمين في البيتا وتحديث الحالة يدويًا." />
      {params.updated === "1" ? <Alert variant="success">تم تحديث الـ feedback.</Alert> : null}
      {params.error ? <Alert variant="danger">تعذّر التحديث. راجع المدخلات وحاول مرة تانية.</Alert> : null}
      <form className="flex gap-2" method="get">
        <select name="status" defaultValue={statusFilter} className="rounded border px-2 py-1 text-sm">{STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}</select>
        <select name="type" defaultValue={typeFilter} className="rounded border px-2 py-1 text-sm">{TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}</select>
        <Button type="submit" variant="secondary" size="sm">تصفية</Button>
      </form>
      {rows.length === 0 ? <EmptyState title="لا يوجد feedback مطابق." subtitle="جرّب فلتر مختلف." /> : rows.map((item) => (
        <Card key={item.id}><CardContent className="space-y-2">
          <div className="flex gap-2"><StatusBadge variant="muted">{item.feedback_type}</StatusBadge><StatusBadge variant="warning">{item.status}</StatusBadge></div>
          <p className="font-semibold">{item.subject}</p>
          {item.details ? <p className="text-sm text-stone-700">{item.details.slice(0, 280)}</p> : null}
          {item.page_path ? <p className="text-xs">الصفحة: {item.page_path}</p> : null}
          <p className="text-xs text-stone-600">{new Date(item.created_at).toLocaleDateString("ar-EG")}</p>
          {item.admin_note ? <p className="text-sm">ملاحظة الإدارة: {item.admin_note}</p> : null}
          <form action={updateFeedbackStatus} className="space-y-2">
            <input type="hidden" name="feedback_id" value={item.id} />
            <input type="hidden" name="status_filter" value={statusFilter} />
            <input type="hidden" name="type_filter" value={typeFilter} />
            <select name="status" defaultValue={item.status} className="rounded border px-2 py-1 text-sm">{STATUS_OPTIONS.filter((s) => s !== "all").map((s) => <option key={s} value={s}>{s}</option>)}</select>
            <textarea name="admin_note" defaultValue={item.admin_note ?? ""} maxLength={1000} rows={3} className="block w-full rounded border px-2 py-1 text-sm" />
            <Button type="submit" variant="secondary" size="sm">حدّث الحالة</Button>
          </form>
        </CardContent></Card>
      ))}
    </section>
  );
}
