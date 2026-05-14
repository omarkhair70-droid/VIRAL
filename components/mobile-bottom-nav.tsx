import { getShellRequestState } from "@/lib/shell-request-state";
import { MobileBottomNavClient } from "@/components/mobile-bottom-nav-client";

export async function MobileBottomNav() {
  const { loggedIn, unreadMessagesCount } = await getShellRequestState();
  if (!loggedIn) return null;

  return <MobileBottomNavClient unreadMessagesCount={unreadMessagesCount} />;
}
