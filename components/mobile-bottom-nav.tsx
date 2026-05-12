import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export async function MobileBottomNav() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;

  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", data.user.id)
    .is("read_at", null);
  const unreadNotificationsCount = count ?? 0;

  return (
    <nav className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-30 border-t border-warmBorder bg-sand/95 px-3 pt-2 backdrop-blur sm:hidden">
      <ul className="mx-auto grid max-w-md grid-cols-4 gap-1.5 text-center text-[11px] font-medium text-muted">
        <li>
          <Link className="flex min-h-14 flex-col items-center justify-center rounded-xl px-2 py-1.5" href="/items">
            <span aria-hidden className="text-sm">🛍️</span>
            <span>السوق</span>
          </Link>
        </li>
        <li>
          <Link className="flex min-h-14 flex-col items-center justify-center rounded-xl bg-clay px-2 py-1.5 font-semibold text-white shadow-sm" href="/items/new">
            <span aria-hidden className="text-sm">＋</span>
            <span>اعرض</span>
          </Link>
        </li>
        <li>
          <Link className="relative flex min-h-14 flex-col items-center justify-center rounded-xl px-2 py-1.5" href="/notifications">
            <span aria-hidden className="text-sm">🔔</span>
            <span>الإشعارات</span>
            {unreadNotificationsCount > 0 ? (
              <span className="absolute right-4 top-1.5 min-w-4 rounded-full bg-clay px-1 text-center text-[10px] font-semibold leading-4 text-white">
                {unreadNotificationsCount > 9 ? "9+" : unreadNotificationsCount}
              </span>
            ) : null}
          </Link>
        </li>
        <li>
          <Link className="flex min-h-14 flex-col items-center justify-center rounded-xl px-2 py-1.5" href="/dashboard">
            <span aria-hidden className="text-sm">👤</span>
            <span>حسابي</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
