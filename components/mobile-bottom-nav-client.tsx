"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppIcon } from "@/components/ui/app-icon";

type MobileBottomNavClientProps = {
  unreadMessagesCount: number;
};

function isMarketActive(pathname: string) {
  return pathname === "/items" || (pathname.startsWith("/items/") && pathname !== "/items/new");
}

export function MobileBottomNavClient({ unreadMessagesCount }: MobileBottomNavClientProps) {
  const pathname = usePathname();

  const navItemClass = "flex min-h-14 flex-col items-center justify-center rounded-xl px-2 py-1.5";
  const activeNavItemClass = "bg-white text-ink shadow-sm ring-1 ring-warmBorder";
  const inactiveNavItemClass = "text-muted";

  const marketActive = isMarketActive(pathname);
  const peopleActive = pathname === "/people" || pathname.startsWith("/users/");
  const publishActive = pathname === "/items/new";
  const messagesActive = pathname.startsWith("/messages");
  const dashboardActive =
    pathname.startsWith("/dashboard") ||
    pathname === "/profile" ||
    (pathname.startsWith("/offers/") && pathname !== "/offers/new") ||
    pathname.startsWith("/deals/");

  return (
    <nav className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-30 border-t border-warmBorder bg-sand/95 px-3 pt-2 backdrop-blur sm:hidden" aria-label="التنقل السفلي">
      <ul className="mx-auto grid max-w-md grid-cols-5 gap-1.5 text-center text-[11px] font-medium">
        <li>
          <Link aria-current={marketActive ? "page" : undefined} className={`${navItemClass} ${marketActive ? activeNavItemClass : inactiveNavItemClass}`} href="/items">
            <AppIcon name="market" className="h-4 w-4" />
            <span className="mt-0.5">السوق</span>
          </Link>
        </li>
        <li>
          <Link aria-current={peopleActive ? "page" : undefined} className={`${navItemClass} ${peopleActive ? activeNavItemClass : inactiveNavItemClass}`} href="/people">
            <AppIcon name="user-plus" className="h-4 w-4" />
            <span className="mt-0.5">الناس</span>
          </Link>
        </li>
        <li>
          <Link aria-current={publishActive ? "page" : undefined} className={`${navItemClass} bg-clay font-semibold text-white shadow-sm ${publishActive ? "ring-2 ring-clayDark/40" : ""}`} href="/items/new">
            <AppIcon name="publish" className="h-4 w-4" />
            <span className="mt-0.5">اعرض</span>
          </Link>
        </li>
        <li>
          <Link aria-current={messagesActive ? "page" : undefined} className={`relative ${navItemClass} ${messagesActive ? activeNavItemClass : inactiveNavItemClass}`} href="/messages">
            <AppIcon name="chat" className="h-4 w-4" />
            <span className="mt-0.5">الرسائل</span>
            {unreadMessagesCount > 0 ? (
              <span className="absolute right-4 top-1.5 min-w-4 rounded-full bg-clay px-1 text-center text-[10px] font-semibold leading-4 text-white">
                {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
              </span>
            ) : null}
          </Link>
        </li>
        <li>
          <Link aria-current={dashboardActive ? "page" : undefined} className={`${navItemClass} ${dashboardActive ? activeNavItemClass : inactiveNavItemClass}`} href="/dashboard">
            <AppIcon name="profile" className="h-4 w-4" />
            <span className="mt-0.5">حسابي</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
