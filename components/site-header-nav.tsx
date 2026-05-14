"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthButton } from "@/components/auth-button";
import { AppIcon } from "@/components/ui/app-icon";

type SiteHeaderNavProps = {
  loggedIn: boolean;
  unreadNotificationsCount: number;
  unreadMessagesCount: number;
};

function isExploreActive(pathname: string) {
  return pathname === "/items" || (pathname.startsWith("/items/") && pathname !== "/items/new");
}

export function SiteHeaderNav({ loggedIn, unreadNotificationsCount, unreadMessagesCount }: SiteHeaderNavProps) {
  const pathname = usePathname();
  const itemClass = "rounded-lg px-2.5 py-2 text-app-text-secondary transition-colors duration-200 hover:bg-app-soft hover:text-app-text-primary motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-focus focus-visible:ring-offset-2";
  const activeClass = "bg-white text-app-text-primary shadow-sm ring-1 ring-app-border";

  const peopleActive = pathname === "/people" || pathname.startsWith("/users/");
  const messagesActive = pathname.startsWith("/messages");
  const publishActive = pathname === "/items/new";
  const accountActive = pathname.startsWith("/dashboard") || pathname === "/profile" || (pathname.startsWith("/offers/") && pathname !== "/offers/new") || pathname.startsWith("/deals/");
  const notificationsActive = pathname.startsWith("/notifications");

  if (!loggedIn) {
    return <nav className="hidden max-w-full items-center justify-end gap-1.5 text-sm sm:flex sm:gap-2"><Link className={`${itemClass} ${isExploreActive(pathname) ? activeClass : ""}`} href="/items">استكشف</Link><Link className={`${itemClass} ${peopleActive ? activeClass : ""}`} href="/people">الناس</Link><Link className={`${itemClass} ${pathname.startsWith("/how-it-works") ? activeClass : ""}`} href="/how-it-works">إزاي بتشتغل</Link><Link className={`${itemClass} ${pathname.startsWith("/safety") ? activeClass : ""}`} href="/safety">الأمان</Link><AuthButton loggedIn={false} /></nav>;
  }

  return (
    <nav className="hidden max-w-full items-center justify-end gap-1.5 text-sm sm:flex sm:gap-2">
      <Link className={`${itemClass} ${isExploreActive(pathname) ? activeClass : ""}`} href="/items">استكشف</Link>
      <Link className={`${itemClass} ${peopleActive ? activeClass : ""}`} href="/people">الناس</Link>
      <Link className={`relative ${itemClass} ${messagesActive ? activeClass : ""}`} href="/messages">
        الرسائل
        {unreadMessagesCount > 0 ? <span className="ms-1 rounded-full bg-app-accent px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">{unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}</span> : null}
      </Link>
      <Link className={`rounded-lg bg-app-accent px-2.5 py-2 font-semibold text-white shadow-sm transition duration-200 hover:bg-app-accent-hover active:translate-y-px motion-reduce:translate-y-0 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-focus focus-visible:ring-offset-2 ${publishActive ? "ring-2 ring-app-accent/40" : ""}`} href="/items/new">اعرض حاجة</Link>
      <Link aria-label="الإشعارات" className={`relative rounded-xl border border-app-border bg-white/90 p-2 text-app-text-primary transition-colors duration-200 hover:bg-app-soft motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-focus focus-visible:ring-offset-2 ${notificationsActive ? "ring-1 ring-app-border" : ""}`} href="/notifications">
        <AppIcon name="bell" className="h-4 w-4" />
        {unreadNotificationsCount > 0 ? <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-app-accent px-1 text-center text-[10px] font-semibold leading-5 text-white">{unreadNotificationsCount > 9 ? "9+" : unreadNotificationsCount}</span> : null}
      </Link>
      <Link className={`${itemClass} ${accountActive ? activeClass : ""}`} href="/dashboard">حسابي</Link>
      <AuthButton loggedIn />
    </nav>
  );
}
