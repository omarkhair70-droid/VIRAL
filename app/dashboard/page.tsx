import { redirect } from "next/navigation";
import { EmptyState } from "@/components/empty-state";
import { PageShell } from "@/components/page-shell";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  return (
    <PageShell title="حسابي">
      <EmptyState title="أهلاً بيك" hint="داشبود الحساب جاهز كبداية. تدفقات السوق لسه في المرحلة 1." />
    </PageShell>
  );
}
