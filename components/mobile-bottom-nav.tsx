import { createClient } from "@/lib/supabase/server";
import { MobileBottomNavClient } from "@/components/mobile-bottom-nav-client";

export async function MobileBottomNav() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;

  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", data.user.id)
    .is("read_at", null);

  return <MobileBottomNavClient unreadNotificationsCount={count ?? 0} />;
}
