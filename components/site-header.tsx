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
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-sand/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex flex-col">
          <span className="text-xl font-bold">بدّلها</span>
          <span className="hidden text-xs text-stone-500 sm:block">بدّل الحاجة بدل ما تسيبها مركونة</span>
        </Link>

        <nav className="flex flex-wrap items-center justify-end gap-2 text-sm">
          <Link className="rounded-lg px-2 py-1.5" href="/items">السوق</Link>
          {loggedIn ? <Link className="rounded-lg px-2 py-1.5" href="/items/new">اعرض حاجة</Link> : null}
          {!loggedIn ? <Link className="rounded-lg px-2 py-1.5" href="/how-it-works">إزاي بتشتغل</Link> : null}
          {loggedIn ? <Link className="rounded-lg px-2 py-1.5" href="/dashboard">حسابي</Link> : null}
          {loggedIn ? <Link className="rounded-lg px-2 py-1.5" href="/notifications">الإشعارات{unreadNotificationsCount > 0 ? ` (${unreadNotificationsCount})` : ""}</Link> : null}
          <Link className="rounded-lg px-2 py-1.5" href="/safety">الأمان</Link>
          <AuthButton loggedIn={loggedIn} />
        </nav>
      </div>
    </header>
  );
}
