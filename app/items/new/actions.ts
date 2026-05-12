"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function parseImagePaths(raw: string): string[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is string => typeof value === "string");
  } catch {
    return [];
  }
}

export type CreateItemResult = { ok: true; itemId: string } | { ok: false; error: "validation" | "publish" };

export async function createItem(formData: FormData): Promise<CreateItemResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/items/new");
  }

  const itemId = String(formData.get("item_id") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const category_id = String(formData.get("category_id") || "").trim() || null;
  const description = String(formData.get("description") || "").trim() || null;
  const condition = String(formData.get("condition") || "good_used");
  const condition_notes = String(formData.get("condition_notes") || "").trim() || null;
  const city = String(formData.get("city") || "").trim() || null;
  const area = String(formData.get("area") || "").trim() || null;
  const desire_mode = String(formData.get("desire_mode") || "flexible");
  const desire_text = String(formData.get("desire_text") || "").trim() || null;
  const item_story = String(formData.get("item_story") || "").trim() || null;
  const swap_reason = String(formData.get("swap_reason") || "").trim() || null;
  const good_for = String(formData.get("good_for") || "").trim() || null;
  const wantedTagsRaw = String(formData.get("wanted_tags") || "").trim();
  const uploadedPathsRaw = String(formData.get("uploaded_image_paths_json") || "[]");
  const uploadedPaths = parseImagePaths(uploadedPathsRaw);

  if (!itemId || !title || !condition || !desire_mode) {
    return { ok: false, error: "validation" };
  }

  if ((item_story && item_story.length > 600) || (swap_reason && swap_reason.length > 240) || (good_for && good_for.length > 240)) {
    return { ok: false, error: "validation" };
  }

  if (uploadedPaths.length < 1 || uploadedPaths.length > 4) {
    return { ok: false, error: "validation" };
  }

  const expectedPrefix = `items/${user.id}/${itemId}/`;
  const invalidPath = uploadedPaths.some((path) => !path.startsWith(expectedPrefix));
  if (invalidPath) {
    return { ok: false, error: "validation" };
  }

  const { data: item, error } = await supabase
    .from("items")
    .insert({
      id: itemId,
      title,
      category_id,
      description,
      condition,
      condition_notes,
      city,
      area,
      desire_mode,
      desire_text,
      item_story,
      swap_reason,
      good_for,
      owner_id: user.id,
      status: "active",
      source: "direct_listing",
    })
    .select("id")
    .single();

  if (error || !item) {
    console.error("Failed to create item", error);
    return { ok: false, error: "publish" };
  }

  const itemImagesPayload = uploadedPaths.map((path, index) => {
    const { data } = supabase.storage.from("item-images").getPublicUrl(path);
    return {
      item_id: item.id,
      image_url: data.publicUrl,
      is_primary: index === 0,
      sort_order: index,
    };
  });

  const { error: imageInsertError } = await supabase.from("item_images").insert(itemImagesPayload);
  if (imageInsertError) {
    console.error("Failed to insert item images", imageInsertError);
    return { ok: false, error: "publish" };
  }

  const tags = wantedTagsRaw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  if (tags.length > 0) {
    const { error: tagsError } = await supabase.from("item_wanted_tags").insert(tags.map((tag) => ({ item_id: item.id, tag })));
    if (tagsError) {
      console.error("Failed to insert wanted tags", tagsError);
    }
  }

  return { ok: true, itemId: item.id };
}
