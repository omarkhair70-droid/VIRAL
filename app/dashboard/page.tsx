import Link from "next/link";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard");

  return (
    <PageShell title="حسابي">
      <div className="space-y-2 rounded-xl border border-stone-200 bg-white p-4">
        <p className="font-semibold">أهلاً بيك 👋</p>
        <p className="text-stone-700">
          إنت دلوقتي داخل. تقدر تكمل نشر إعلان جديد أو تراجع عروضك.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/items" className="rounded-xl border bg-white p-4 font-semibold">
          حاجاتي
        </Link>
        <Link href="/offers/new" className="rounded-xl border bg-white p-4 font-semibold">
          عروض وصلتني
        </Link>
        <Link href="/offers/new" className="rounded-xl border bg-white p-4 font-semibold">
          عروض بعتها
        </Link>
        <Link href="/deals" className="rounded-xl border bg-white p-4 font-semibold">
          صفقات مقبولة
        </Link>
      </div>
    </PageShell>
  );
}
