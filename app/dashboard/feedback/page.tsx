import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeading } from "@/components/ui/page-heading";
import { StatusBadge } from "@/components/ui/status-badge";
import { createClient } from "@/lib/supabase/server";

export default async function MyFeedbackPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/feedback");

  const { data } = await supabase.from("feedback").select("id,feedback_type,status,subject,created_at,admin_note").order("created_at", { ascending: false });
  const rows = data ?? [];

  return <section className="mx-auto max-w-4xl space-y-4 px-4 py-10">
    <PageHeading title="Feedback اللي بعته" subtitle="متابعة سريعة للحالات والملاحظات من فريق تِسوى." />
    {rows.length === 0 ? <EmptyState title="لسه ما بعتش feedback." subtitle="ابعت أول رسالة من صفحة feedback." /> : rows.map((row) => <Card key={row.id}><CardContent className="space-y-1"><div className="flex gap-2"><StatusBadge variant="muted">{row.feedback_type}</StatusBadge><StatusBadge variant="warning">{row.status}</StatusBadge></div><p className="font-semibold">{row.subject}</p><p className="text-xs text-stone-600">{new Date(row.created_at).toLocaleDateString("ar-EG")}</p>{row.admin_note ? <p className="text-sm">ملاحظة الإدارة: {row.admin_note}</p> : null}</CardContent></Card>)}
  </section>;
}
