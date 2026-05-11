import Image from "next/image";
import Link from "next/link";
import { AuthButton } from "@/components/auth-button";
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
      <div className="mx-auto flex max-w-6xl items-start justify-between gap-3 px-4 py-3 sm:items-center">
        <Link href="/" className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <Image src="/brand/baddelha-mark.svg" alt="شعار بدّلها" width={28} height={28} className="shrink-0" />
            <span className="block truncate text-xl font-bold text-ink">بدّلها</span>
          </span>
          <span className="hidden text-xs text-muted sm:block">بدّل الحاجة بدل ما تسيبها مركونة.</span>
        </Link>

        <nav className="flex max-w-full flex-wrap items-center justify-end gap-1.5 text-sm sm:gap-2">
          <Link className="rounded-lg px-2.5 py-2" href="/items">السوق</Link>
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
