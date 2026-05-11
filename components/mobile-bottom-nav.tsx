import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export async function MobileBottomNav() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;

  return (
    <nav className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-sand/95 px-3 pt-2 backdrop-blur sm:hidden">
      <ul className="mx-auto grid max-w-6xl grid-cols-4 gap-2 text-center text-xs font-medium">
        <li><Link className="block rounded-lg px-2 py-2.5" href="/items">السوق</Link></li>
        <li><Link className="block rounded-lg px-2 py-2.5" href="/items/new">اعرض</Link></li>
        <li><Link className="block rounded-lg px-2 py-2.5" href="/notifications">الإشعارات</Link></li>
        <li><Link className="block rounded-lg px-2 py-2.5" href="/dashboard">حسابي</Link></li>
      </ul>
    </nav>
  );
}
