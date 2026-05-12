import Image from "next/image";
import Link from "next/link";
import { AuthButton } from "@/components/auth-button";
import { AppIcon } from "@/components/ui/app-icon";
import { createClient } from "@/lib/supabase/server";

export async function SiteHeader() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const loggedIn = Boolean(data.user);

  let unreadNotificationsCount = 0;
  if (data.user) {
    const { count } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", data.user.id)
      .is("read_at", null);
    unreadNotificationsCount = count ?? 0;
  }

  return (
    <header className="sticky top-0 z-20 border-b border-warmBorder bg-sand/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:py-3">
        <Link href="/" className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <Image src="/brand/baddelha-horizontal.png" alt="بدّلها" width={168} height={36} className="h-8 w-auto shrink-0 sm:h-9" priority />
          </span>
          <span className="hidden text-xs text-muted sm:block">بدّل الحاجة بدل ما تسيبها مركونة.</span>
        </Link>

        <div className="flex items-center gap-1 sm:hidden">
          {loggedIn ? (
            <Link aria-label="الإشعارات" className="relative rounded-xl border border-warmBorder bg-white/70 p-2 text-ink" href="/notifications">
              <AppIcon name="bell" className="h-4 w-4" />
              {unreadNotificationsCount > 0 ? (
                <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-clay px-1 text-center text-[10px] font-semibold leading-5 text-white">
                  {unreadNotificationsCount > 9 ? "9+" : unreadNotificationsCount}
                </span>
              ) : null}
            </Link>
          ) : null}
          <Link aria-label={loggedIn ? "حسابي" : "تسجيل الدخول"} className="rounded-xl border border-warmBorder bg-white/70 p-2 text-ink" href={loggedIn ? "/dashboard" : "/login"}>
            <AppIcon name={loggedIn ? "profile" : "forward"} className="h-4 w-4" />
          </Link>
        </div>

        <nav className="hidden max-w-full items-center justify-end gap-1.5 text-sm sm:flex sm:gap-2">
          <Link className="rounded-lg px-2.5 py-2" href="/items">السوق</Link>
          <Link className="rounded-lg px-2.5 py-2" href="/drops">الدروب</Link>
          {loggedIn ? <Link className="rounded-lg px-2.5 py-2" href="/items/new">اعرض حاجة</Link> : null}
          {!loggedIn ? <Link className="rounded-lg px-2.5 py-2" href="/how-it-works">إزاي بتشتغل</Link> : null}
          {loggedIn ? <Link className="rounded-lg px-2.5 py-2" href="/dashboard">حسابي</Link> : null}
          {loggedIn ? <Link className="rounded-lg px-2.5 py-2" href="/notifications">الإشعارات{unreadNotificationsCount > 0 ? ` (${unreadNotificationsCount})` : ""}</Link> : null}
          <Link className="rounded-lg px-2.5 py-2" href="/safety">الأمان</Link>
          <AuthButton loggedIn={loggedIn} />
        </nav>
      </div>
    </header>
  );
}
