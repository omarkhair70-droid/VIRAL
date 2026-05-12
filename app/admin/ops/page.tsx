import { notFound, redirect } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeading } from "@/components/ui/page-heading";
import { StatusBadge } from "@/components/ui/status-badge";
import { isCurrentUserAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

type SnapshotItem = { label: string; value: number };

async function countRows(supabase: Awaited<ReturnType<typeof createClient>>, table: string, filter?: { column: string; value: string | null }) {
  let query = supabase.from(table).select("id", { count: "exact", head: true });
  if (filter) query = query.eq(filter.column, filter.value);
  const { count } = await query;
  return count ?? 0;
}

export default async function AdminOpsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/admin/ops");
  if (!(await isCurrentUserAdmin(supabase))) notFound();

  const snapshot: SnapshotItem[] = [
    { label: "إجمالي الملفات", value: await countRows(supabase, "profiles") },
    { label: "إعلانات نشطة", value: await countRows(supabase, "items", { column: "status", value: "active" }) },
    { label: "إعلانات محجوزة", value: await countRows(supabase, "items", { column: "status", value: "reserved" }) },
    { label: "إعلانات متبادلة", value: await countRows(supabase, "items", { column: "status", value: "swapped" }) },
    { label: "إجمالي العروض", value: await countRows(supabase, "offers") },
    { label: "عروض pending", value: await countRows(supabase, "offers", { column: "status", value: "pending" }) },
    { label: "عروض accepted", value: await countRows(supabase, "offers", { column: "status", value: "accepted" }) },
    { label: "عروض redirected", value: await countRows(supabase, "offers", { column: "status", value: "redirected" }) },
    { label: "إجمالي الصفقات", value: await countRows(supabase, "swap_deals") },
    { label: "صفقات coordinating", value: await countRows(supabase, "swap_deals", { column: "status", value: "coordinating" }) },
    { label: "صفقات completed", value: await countRows(supabase, "swap_deals", { column: "status", value: "completed" }) },
    { label: "بلاغات مفتوحة", value: await countRows(supabase, "reports", { column: "status", value: "open" }) },
    { label: "بلاغات under review", value: await countRows(supabase, "reports", { column: "status", value: "reviewing" }) },
    { label: "إجمالي feedback", value: await countRows(supabase, "feedback") },
    { label: "Feedback جديد", value: await countRows(supabase, "feedback", { column: "status", value: "new" }) },
    { label: "Feedback planned", value: await countRows(supabase, "feedback", { column: "status", value: "planned" }) },
    { label: "Feedback dismissed", value: await countRows(supabase, "feedback", { column: "status", value: "dismissed" }) },
  ];

  return (
    <section className="mx-auto max-w-5xl space-y-6 px-4 py-10">
      <PageHeading title="Operations Snapshot" subtitle="لقطة تشغيلية سريعة للمشرفين أثناء الـ controlled beta (قراءة فقط)." />

      <Card>
        <CardHeader><CardTitle>Platform Snapshot</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {snapshot.map((item) => (
              <div key={item.label} className="rounded-lg border p-3">
                <p className="text-sm text-stone-600">{item.label}</p>
                <p className="text-2xl font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Beta Watchlist</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm text-stone-700">
          <p><StatusBadge variant="warning">1</StatusBadge> Check storage usage in Supabase.</p>
          <p><StatusBadge variant="warning">2</StatusBadge> Check latest deployment logs in Vercel.</p>
          <p><StatusBadge variant="warning">3</StatusBadge> Review open reports.</p>
          <p><StatusBadge variant="warning">4</StatusBadge> Run <code>npm run smoke</code>.</p>
          <p><StatusBadge variant="warning">5</StatusBadge> Test offer/deal flow after releases.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Release Links</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <ButtonLink href="/admin/reports" variant="secondary" size="sm">/admin/reports</ButtonLink>
          <ButtonLink href="/admin/feedback" variant="secondary" size="sm">/admin/feedback</ButtonLink>
          <ButtonLink href="/dashboard" variant="secondary" size="sm">/dashboard</ButtonLink>
          <ButtonLink href="/items" variant="secondary" size="sm">/items</ButtonLink>
          <ButtonLink href="/notifications" variant="secondary" size="sm">/notifications</ButtonLink>
        </CardContent>
      </Card>
    </section>
  );
}
