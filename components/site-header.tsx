import Image from "next/image";
import Link from "next/link";
import { AppIcon } from "@/components/ui/app-icon";
import { getShellRequestState } from "@/lib/shell-request-state";
import { SiteHeaderNav } from "@/components/site-header-nav";

export async function SiteHeader() {
  const { loggedIn, unreadNotificationsCount, unreadMessagesCount } = await getShellRequestState();

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
