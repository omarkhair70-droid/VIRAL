import Link from "next/link";
import { PageShell } from "@/components/page-shell";

export default function HomePage() {
  return (
    <PageShell title="يمكن الحاجة اللي مركونة عندك هي بالظبط اللي حد تاني بيدور عليها." subtitle="مش كل حاجة ما بتتباعش تبقى مالهاش قيمة.">
      <div className="flex flex-wrap gap-3">
        <Link href="/discover" className="rounded-xl bg-clay px-4 py-2 text-white">شوف حاجتك ممكن تجيبلك إيه</Link>
        <Link href="/feed" className="rounded-xl border px-4 py-2">اتفرّج على الصفقات الغريبة</Link>
        <Link href="/items/new" className="rounded-xl border px-4 py-2">اعرض حاجة</Link>
        <Link href="/items" className="rounded-xl border px-4 py-2">افتح السوق</Link>
      </div>
    </PageShell>
  );
}
