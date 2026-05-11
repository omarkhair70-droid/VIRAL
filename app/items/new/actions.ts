"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createItem(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/items/new");
  }

  const title = String(formData.get("title") || "").trim();
  const category_id = String(formData.get("category_id") || "").trim() || null;
  const image_url = String(formData.get("image_url") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const condition = String(formData.get("condition") || "good_used");
  const condition_notes = String(formData.get("condition_notes") || "").trim() || null;
  const city = String(formData.get("city") || "").trim() || null;
  const area = String(formData.get("area") || "").trim() || null;
  const desire_mode = String(formData.get("desire_mode") || "flexible");
  const desire_text = String(formData.get("desire_text") || "").trim() || null;
  const wantedTagsRaw = String(formData.get("wanted_tags") || "").trim();

  if (!title || !image_url || !condition || !desire_mode) {
    redirect("/items/new?error=validation");
  }

  const { data: item, error } = await supabase
    .from("items")
    .insert({ title, category_id, description, condition, condition_notes, city, area, desire_mode, desire_text, owner_id: user.id, status: "active", source: "direct_listing" })
    .select("id")
    .single();

  if (error || !item) {
    redirect("/items/new?error=publish");
  }

  await supabase.from("item_images").insert({ item_id: item.id, image_url, is_primary: true, sort_order: 0 });

  const tags = wantedTagsRaw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  if (tags.length > 0) {
    await supabase.from("item_wanted_tags").insert(tags.map((tag) => ({ item_id: item.id, tag })));
  }

  redirect(`/items/${item.id}`);
}
