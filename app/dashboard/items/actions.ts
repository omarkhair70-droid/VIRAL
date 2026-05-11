"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard/items");

  return { supabase, user };
}

export async function archiveItem(formData: FormData) {
  const { supabase, user } = await requireUser();
  const itemId = String(formData.get("item_id") || "").trim();
  if (!itemId) redirect("/dashboard/items");

  await supabase
    .from("items")
    .update({ status: "archived" })
    .eq("id", itemId)
    .eq("owner_id", user.id)
    .eq("status", "active");

  redirect("/dashboard/items?updated=archived");
}

export async function reactivateItem(formData: FormData) {
  const { supabase, user } = await requireUser();
  const itemId = String(formData.get("item_id") || "").trim();
  if (!itemId) redirect("/dashboard/items");

  await supabase
    .from("items")
    .update({ status: "active" })
    .eq("id", itemId)
    .eq("owner_id", user.id)
    .eq("status", "archived");

  redirect("/dashboard/items?updated=reactivated");
}
