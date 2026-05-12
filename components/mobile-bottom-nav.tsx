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
            <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16l-1.2 10.2a2 2 0 0 1-2 1.8H7.2a2 2 0 0 1-2-1.8L4 8Zm5-1V6a3 3 0 1 1 6 0v1" />
            </svg>
            <span>السوق</span>
          </Link>
        </li>
        <li>
          <Link className="flex min-h-14 flex-col items-center justify-center rounded-xl bg-clay px-2 py-1.5 font-semibold text-white shadow-sm" href="/items/new">
            <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.1">
              <path strokeLinecap="round" d="M12 5v14M5 12h14" />
            </svg>
            <span>اعرض</span>
          </Link>
        </li>
        <li>
          <Link className="relative flex min-h-14 flex-col items-center justify-center rounded-xl px-2 py-1.5" href="/notifications">
            <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4a4 4 0 0 0-4 4v1.2c0 1.2-.4 2.3-1.2 3.2L5 14.3h14l-1.8-1.9A4.8 4.8 0 0 1 16 9.2V8a4 4 0 0 0-4-4Z" />
              <path strokeLinecap="round" d="M10 17a2 2 0 0 0 4 0" />
            </svg>
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
            <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9">
              <circle cx="12" cy="8" r="3.2" />
              <path strokeLinecap="round" d="M5.5 19a6.5 6.5 0 0 1 13 0" />
            </svg>
            <span>حسابي</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
