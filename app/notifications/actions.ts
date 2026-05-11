"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function getFilter(input: FormDataEntryValue | null): "all" | "unread" {
  return input === "unread" ? "unread" : "all";
}

export async function markNotificationRead(formData: FormData) {
  const notificationId = String(formData.get("notification_id") ?? "").trim();
  const filter = getFilter(formData.get("filter"));

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/notifications");
  if (!notificationId) redirect(`/notifications${filter === "unread" ? "?filter=unread" : ""}`);

  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", user.id)
    .is("read_at", null);

  redirect(`/notifications${filter === "unread" ? "?filter=unread" : ""}`);
}

export async function markAllNotificationsRead(formData: FormData) {
  void formData;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/notifications");

  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("read_at", null);

  redirect("/notifications?updated=read_all");
}
