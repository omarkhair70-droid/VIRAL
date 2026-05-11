import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const reasonLabels: Record<string, string> = {
  misleading_item: "إعلان مضلل",
  inappropriate_content: "محتوى غير مناسب",
  spam_offer: "عرض مزعج / سبام",
  unsafe_behavior: "تصرف غير آمن",
  no_show: "عدم حضور أو اتفاق فشل",
  other: "سبب آخر",
};

const statusLabels: Record<string, string> = {
  open: "مفتوح",
  reviewing: "تحت المراجعة",
  resolved: "اتحل",
  dismissed: "اتقفل",
};

export default async function MyReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/reports");

  const { data: reports } = await supabase
    .from("reports")
    .select("id,reason,status,details,created_at")
    .order("created_at", { ascending: false });

  return (
    <section className="mx-auto max-w-4xl space-y-4 px-4 py-10">
      <h1 className="text-3xl font-bold">بلاغاتي</h1>
      <p className="text-sm text-stone-600">البلاغات دي خاصة بيك ومش ظاهرة لأي مستخدم تاني.</p>
      {reports?.length ? reports.map((report) => (
        <article key={report.id} className="rounded-xl border bg-white p-4">
          <p className="font-semibold">{reasonLabels[report.reason] ?? report.reason}</p>
          <p className="text-sm text-stone-600">الحالة: {statusLabels[report.status] ?? report.status}</p>
          <p className="text-sm text-stone-600">التاريخ: {new Date(report.created_at).toLocaleDateString("ar-EG")}</p>
          {report.details ? <p className="mt-2 text-sm text-stone-700">{report.details.slice(0, 140)}</p> : null}
        </article>
      )) : <p className="rounded-xl border bg-white p-4 text-stone-600">لسه مفيش بلاغات.</p>}
    </section>
  );
}
