import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

type ShellRequestState = {
  user: Awaited<ReturnType<Awaited<ReturnType<typeof createClient>>["auth"]["getUser"]>>["data"]["user"];
  loggedIn: boolean;
  unreadNotificationsCount: number;
  unreadMessagesCount: number;
};

export const getShellRequestState = cache(async (): Promise<ShellRequestState> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) {
    return {
      user,
      loggedIn: false,
      unreadNotificationsCount: 0,
      unreadMessagesCount: 0,
    };
  }

  const [{ count }, { data: unreadMessagesData, error: unreadMessagesError }] = await Promise.all([
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", user.id).is("read_at", null),
    supabase.rpc("get_unread_deal_messages_count"),
  ]);

  return {
    user,
    loggedIn: true,
    unreadNotificationsCount: count ?? 0,
    unreadMessagesCount: unreadMessagesError ? 0 : Number(unreadMessagesData ?? 0),
  };
});
