import type { SupabaseClient, User } from "@supabase/supabase-js";

type AuthUserResponse = { data: { user: User | null } };

export async function isCurrentUserAdmin(supabase: SupabaseClient): Promise<boolean> {
  const { data: { user } } = (await supabase.auth.getUser()) as AuthUserResponse;
  if (!user) return false;

  const { data, error } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) return false;
  return Boolean(data?.user_id);
}
