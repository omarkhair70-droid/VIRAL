"use server";

import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const validConditions = new Set(["almost_new", "good_used", "minor_issues", "needs_repair"]);
const validDesireModes = new Set(["specific", "flexible", "surprise"]);

export async function updateItem(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const itemId = String(formData.get("item_id") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const categoryIdRaw = String(formData.get("category_id") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const condition = String(formData.get("condition") || "").trim();
  const condition_notes = String(formData.get("condition_notes") || "").trim() || null;
  const city = String(formData.get("city") || "").trim() || null;
  const area = String(formData.get("area") || "").trim() || null;
  const desire_mode = String(formData.get("desire_mode") || "").trim();
  const desire_text = String(formData.get("desire_text") || "").trim() || null;
  const item_story = String(formData.get("item_story") || "").trim() || null;
  const swap_reason = String(formData.get("swap_reason") || "").trim() || null;
  const good_for = String(formData.get("good_for") || "").trim() || null;
  const wantedTagsRaw = String(formData.get("wanted_tags") || "").trim();

  if (!itemId || !title || !validConditions.has(condition) || !validDesireModes.has(desire_mode)) notFound();
  if ((item_story && item_story.length > 600) || (swap_reason && swap_reason.length > 240) || (good_for && good_for.length > 240)) notFound();

  const { data: ownItem } = await supabase.from("items").select("id").eq("id", itemId).eq("owner_id", user.id).maybeSingle();
  if (!ownItem) notFound();

  const category_id = categoryIdRaw || null;
  if (category_id) {
    const { data: category } = await supabase.from("categories").select("id").eq("id", category_id).eq("is_active", true).maybeSingle();
    if (!category) notFound();
  }

  await supabase.from("items").update({ title, category_id, description, condition, condition_notes, city, area, desire_mode, desire_text, item_story, swap_reason, good_for }).eq("id", itemId).eq("owner_id", user.id);

  await supabase.from("item_wanted_tags").delete().eq("item_id", itemId);
  const tags = [...new Set(wantedTagsRaw.split(",").map((tag) => tag.trim()).filter(Boolean))];
  if (tags.length) {
    await supabase.from("item_wanted_tags").insert(tags.map((tag) => ({ item_id: itemId, tag })));
  }

  redirect(`/items/${itemId}?updated=1`);
}
