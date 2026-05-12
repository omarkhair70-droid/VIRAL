"use server";

import { notFound, redirect } from "next/navigation";
import { isCurrentUserAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

const VALID_STATUS = ["draft", "published"] as const;
const VALID_TYPE = ["artist_drop", "creator_closet", "event_piece", "story_item", "limited_swap"] as const;
const PUBLIC_ITEM_STATUSES = ["active", "reserved", "swapped"] as const;

function get(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function hasText(value: string | null | undefined): boolean {
  return Boolean(value?.trim());
}

async function guard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/drops");
  if (!(await isCurrentUserAdmin(supabase))) notFound();
  return supabase;
}

const cleanSlug = (value: string) => value.toLowerCase().trim().replace(/\s+/g, "-");

export async function featureStoryItem(formData: FormData) {
  const supabase = await guard();
  const itemId = get(formData, "item_id");
  const sortOrder = Number(get(formData, "sort_order") || 0);
  const curatorNote = get(formData, "curator_note").slice(0, 240) || null;

  const { data: item } = await supabase
    .from("items")
    .select("id,status,item_story,swap_reason,good_for")
    .eq("id", itemId)
    .maybeSingle();

  const isStoryRich = hasText(item?.item_story) || hasText(item?.swap_reason) || hasText(item?.good_for);
  if (!item || !PUBLIC_ITEM_STATUSES.includes(item.status) || !isStoryRich) {
    redirect("/admin/drops?error=invalid_story_item");
  }

  const { error } = await supabase.from("featured_story_items").upsert({
    item_id: itemId,
    sort_order: sortOrder,
    curator_note: curatorNote,
  });

  if (error) redirect("/admin/drops?error=feature_failed");
  redirect("/admin/drops?ok=featured");
}

export async function unfeatureStoryItem(formData: FormData) {
  const supabase = await guard();
  const { error } = await supabase.from("featured_story_items").delete().eq("item_id", get(formData, "item_id"));
  if (error) redirect("/admin/drops?error=unfeature_failed");
  redirect("/admin/drops?ok=unfeatured");
}

export async function createDrop(formData: FormData) {
  const supabase = await guard();
  const slug = cleanSlug(get(formData, "slug"));
  const status = get(formData, "status");
  const dropType = get(formData, "drop_type");
  const title = get(formData, "title").slice(0, 120);
  const introCopy = get(formData, "intro_copy").slice(0, 500);

  if (!/^[a-z0-9-]{1,80}$/.test(slug) || !VALID_STATUS.includes(status as (typeof VALID_STATUS)[number]) || !VALID_TYPE.includes(dropType as (typeof VALID_TYPE)[number]) || !title || !introCopy) {
    redirect("/admin/drops?error=invalid_drop");
  }

  const { error } = await supabase.from("creator_drops").insert({
    slug,
    title,
    drop_type: dropType,
    creator_name: get(formData, "creator_name").slice(0, 100) || null,
    intro_copy: introCopy,
    status,
  });
  if (error) redirect("/admin/drops?error=create_drop");
  redirect("/admin/drops?ok=drop_created");
}

export async function updateDrop(formData: FormData) {
  const supabase = await guard();
  const dropId = get(formData, "drop_id");
  const title = get(formData, "title").slice(0, 120);
  const introCopy = get(formData, "intro_copy").slice(0, 500);
  const dropType = get(formData, "drop_type");
  const status = get(formData, "status");

  if (!dropId || !title || !introCopy || !VALID_TYPE.includes(dropType as (typeof VALID_TYPE)[number]) || !VALID_STATUS.includes(status as (typeof VALID_STATUS)[number])) {
    redirect("/admin/drops?error=invalid_drop");
  }

  const { error } = await supabase
    .from("creator_drops")
    .update({
      title,
      drop_type: dropType,
      creator_name: get(formData, "creator_name").slice(0, 100) || null,
      intro_copy: introCopy,
      status,
    })
    .eq("id", dropId);

  if (error) redirect("/admin/drops?error=update_drop");
  redirect("/admin/drops?ok=drop_updated");
}

export async function addItemToDrop(formData: FormData) {
  const supabase = await guard();
  const dropId = get(formData, "drop_id");
  const itemId = get(formData, "item_id");

  const { data: drop } = await supabase.from("creator_drops").select("id").eq("id", dropId).maybeSingle();
  if (!drop) redirect("/admin/drops?error=invalid_drop");

  const { data: item } = await supabase.from("items").select("id,status").eq("id", itemId).maybeSingle();
  if (!item || !PUBLIC_ITEM_STATUSES.includes(item.status)) redirect("/admin/drops?error=invalid_item");

  const { error } = await supabase.from("creator_drop_items").upsert({
    drop_id: dropId,
    item_id: itemId,
    sort_order: Number(get(formData, "sort_order") || 0),
  });

  if (error) redirect("/admin/drops?error=add_item_failed");
  redirect("/admin/drops?ok=item_added");
}

export async function removeItemFromDrop(formData: FormData) {
  const supabase = await guard();
  const { error } = await supabase
    .from("creator_drop_items")
    .delete()
    .eq("drop_id", get(formData, "drop_id"))
    .eq("item_id", get(formData, "item_id"));

  if (error) redirect("/admin/drops?error=remove_item_failed");
  redirect("/admin/drops?ok=item_removed");
}
