import Image from "next/image";
import Link from "next/link";
import { AppIcon } from "@/components/ui/app-icon";
import { createClient } from "@/lib/supabase/server";
import { SiteHeaderNav } from "@/components/site-header-nav";

export async function SiteHeader() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const loggedIn = Boolean(data.user);

  let unreadNotificationsCount = 0;
  let unreadMessagesCount = 0;

  if (data.user) {
    const [{ count }, { data: unreadMessagesData, error: unreadMessagesError }] = await Promise.all([
      supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", data.user.id).is("read_at", null),
      supabase.rpc("get_unread_deal_messages_count"),
    ]);

    unreadNotificationsCount = count ?? 0;
    if (!unreadMessagesError) unreadMessagesCount = Number(unreadMessagesData ?? 0);
  }

  return (
    <header className="sticky top-0 z-20 border-b border-warmBorder bg-sand/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:py-3">
        <Link href="/" className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <Image src="/brand/teswa-logo-horizontal-ar.svg" alt="تِسوى" width={168} height={36} className="h-8 w-auto shrink-0 sm:h-9" priority />
          </span>
          <span className="hidden text-xs text-muted sm:block">حاجتك لسه لها قيمة.</span>
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

        <SiteHeaderNav loggedIn={loggedIn} unreadNotificationsCount={unreadNotificationsCount} unreadMessagesCount={unreadMessagesCount} />
      </div>
    </header>
  );
}
