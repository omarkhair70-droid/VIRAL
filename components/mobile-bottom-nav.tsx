import { createClient } from "@/lib/supabase/server";
import { MobileBottomNavClient } from "@/components/mobile-bottom-nav-client";

export async function MobileBottomNav() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;

  let unreadMessagesCount = 0;
  const { data: unreadCountData, error } = await supabase.rpc("get_unread_deal_messages_count");
  if (!error) unreadMessagesCount = Number(unreadCountData ?? 0);

  return <MobileBottomNavClient unreadMessagesCount={unreadMessagesCount} />;
}
