"use server";
import { redirect } from "next/navigation";
import { createNotification } from "@/lib/notifications";
import { createClient } from "@/lib/supabase/server";

type ItemCondition = "almost_new" | "good_used" | "minor_issues" | "needs_repair";
type DesireMode = "specific" | "flexible" | "surprise";
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

function makeSafeFilename(fileName: string) {
  return fileName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9._-]/g, "").replace(/-+/g, "-").slice(0, 120);
}

type ParentOffer = {
  id: string;
  status: string;
  sender_id: string;
  receiver_id: string;
  requested_item_id: string;
  offered_item_id: string;
};

export async function createOffer(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const requestedItemId = String(formData.get("requested_item_id") || "").trim();
  const parentOfferId = String(formData.get("parent_offer_id") || "").trim() || null;

  if (!user) redirect(`/login?next=/offers/new?requestedItemId=${encodeURIComponent(requestedItemId)}`);
  if (!requestedItemId) redirect("/offers/new?error=missing_requested");

  let parentOffer: ParentOffer | null = null;
  if (parentOfferId) {
    const { data: parent } = await supabase
      .from("offers")
      .select("id,status,sender_id,receiver_id,requested_item_id,offered_item_id")
      .eq("id", parentOfferId)
      .maybeSingle();

    parentOffer = (parent as ParentOffer | null) ?? null;
    if (!parentOffer) redirect(`/offers/new?fromOffer=${encodeURIComponent(parentOfferId)}&error=invalid_parent`);
    if (parentOffer.sender_id !== user.id || parentOffer.status !== "redirected") {
      redirect(`/offers/new?fromOffer=${encodeURIComponent(parentOfferId)}&error=not_followup_allowed`);
    }
    if (requestedItemId !== parentOffer.requested_item_id) {
      redirect(`/offers/new?fromOffer=${encodeURIComponent(parentOfferId)}&error=invalid_parent`);
    }
  }

  const { data: requestedItem } = await supabase.from("items").select("id,owner_id,status,title,offer_count").eq("id", requestedItemId).maybeSingle();
  if (!requestedItem || requestedItem.status !== "active") {
    const base = parentOfferId ? `/offers/new?fromOffer=${encodeURIComponent(parentOfferId)}` : `/offers/new?requestedItemId=${requestedItemId}`;
    redirect(`${base}&error=unavailable`);
  }
  if (requestedItem.owner_id === user.id) {
    const base = parentOfferId ? `/offers/new?fromOffer=${encodeURIComponent(parentOfferId)}` : `/offers/new?requestedItemId=${requestedItemId}`;
    redirect(`${base}&error=own_item`);
  }

  if (parentOffer && requestedItem.owner_id !== parentOffer.receiver_id) {
    redirect(`/offers/new?fromOffer=${encodeURIComponent(parentOffer.id)}&error=invalid_parent`);
  }

  const offerMode = String(formData.get("offer_mode") || "existing_item");
  const message = String(formData.get("message") || "").trim() || null;
  let offeredItemId = "";

  if (offerMode === "existing_item") {
    offeredItemId = String(formData.get("offered_item_id") || "").trim();
    if (!offeredItemId) redirect(`/offers/new?requestedItemId=${requestedItemId}&error=select_item`);
    const { data: ownedItem } = await supabase.from("items").select("id,owner_id,status").eq("id", offeredItemId).maybeSingle();
    if (!ownedItem || ownedItem.owner_id !== user.id || ownedItem.status !== "active") redirect(`/offers/new?requestedItemId=${requestedItemId}&error=invalid_offered`);
  } else {
    const title = String(formData.get("title") || "").trim();
    const categoryId = String(formData.get("category_id") || "").trim() || null;
    const imageFile = formData.get("image_file");
    const description = String(formData.get("description") || "").trim() || null;
    const condition = String(formData.get("condition") || "good_used") as ItemCondition;
    const conditionNotes = String(formData.get("condition_notes") || "").trim() || null;
    const city = String(formData.get("city") || "").trim() || null;
    const area = String(formData.get("area") || "").trim() || null;
    const desireMode = String(formData.get("desire_mode") || "flexible") as DesireMode;
    const desireText = String(formData.get("desire_text") || "").trim() || null;
    const wantedTagsRaw = String(formData.get("wanted_tags") || "").trim();
    const base = parentOfferId ? `/offers/new?fromOffer=${encodeURIComponent(parentOfferId)}` : `/offers/new?requestedItemId=${requestedItemId}`;

    if (!title || !condition || !desireMode) redirect(`/offers/new?requestedItemId=${requestedItemId}&error=validation`);
    if (!(imageFile instanceof File) || imageFile.size === 0) redirect(`${base}&error=image_required`);
    if (!ALLOWED_IMAGE_TYPES.has(imageFile.type)) redirect(`${base}&error=image_type`);
    if (imageFile.size > MAX_IMAGE_SIZE_BYTES) redirect(`${base}&error=image_too_large`);

    const newItemId = crypto.randomUUID();
    const objectPath = `items/${user.id}/${newItemId}/${Date.now()}-${makeSafeFilename(imageFile.name || "image")}`;
    const { error: uploadError } = await supabase.storage.from("item-images").upload(objectPath, imageFile, { upsert: false, contentType: imageFile.type });
    if (uploadError) redirect(`${base}&error=image_upload_failed`);

    const { data: publicData } = supabase.storage.from("item-images").getPublicUrl(objectPath);
    const { data: newItem } = await supabase.from("items").insert({ id: newItemId, owner_id: user.id, status: "active", source: "offer_upload", title, category_id: categoryId, description, condition, condition_notes: conditionNotes, city, area, desire_mode: desireMode, desire_text: desireText }).select("id").single();
    if (!newItem) redirect(`/offers/new?requestedItemId=${requestedItemId}&error=publish`);
    const { error: itemImageError } = await supabase.from("item_images").insert({ item_id: newItem.id, image_url: publicData.publicUrl, is_primary: true, sort_order: 0 });
    if (itemImageError) {
      await supabase.from("items").delete().eq("id", newItem.id);
      await supabase.storage.from("item-images").remove([objectPath]);
      redirect(`${base}&error=publish`);
    }
    const tags = wantedTagsRaw.split(",").map((tag) => tag.trim()).filter(Boolean);
    if (tags.length > 0) await supabase.from("item_wanted_tags").insert(tags.map((tag) => ({ item_id: newItem.id, tag })));
    offeredItemId = newItem.id;
  }

  if (offeredItemId === requestedItemId) redirect(`/offers/new?requestedItemId=${requestedItemId}&error=invalid_offered`);

  if (parentOffer) {
    if (offeredItemId === parentOffer.offered_item_id) {
      redirect(`/offers/new?fromOffer=${encodeURIComponent(parentOffer.id)}&error=same_offered_item`);
    }

    const { data: duplicate } = await supabase.from("offers").select("id").eq("parent_offer_id", parentOffer.id).eq("offered_item_id", offeredItemId).in("status", ["pending", "thinking", "accepted"]).maybeSingle();
    if (duplicate) {
      redirect(`/offers/new?fromOffer=${encodeURIComponent(parentOffer.id)}&error=duplicate_followup`);
    }
  }

  let offer: { id: string } | null = null;
  if (parentOffer) {
    const { data } = await supabase.from("offers").insert({ requested_item_id: parentOffer.requested_item_id, offered_item_id: offeredItemId, sender_id: user.id, receiver_id: parentOffer.receiver_id, status: "pending", message, parent_offer_id: parentOffer.id }).select("id").single();
    offer = data;
  } else {
    const { data } = await supabase.from("offers").insert({ requested_item_id: requestedItemId, offered_item_id: offeredItemId, sender_id: user.id, receiver_id: requestedItem.owner_id, status: "pending", message }).select("id").single();
    offer = data;
  }

  if (!offer) redirect(`/offers/new?requestedItemId=${requestedItemId}&error=offer_failed`);
  await supabase.from("offer_events").insert({ offer_id: offer.id, actor_id: user.id, event_type: "created", old_status: null, new_status: "pending", note: parentOffer ? "عرض جديد بعد فتح باب تاني" : null });
  if (typeof requestedItem.offer_count === "number") await supabase.from("items").update({ offer_count: requestedItem.offer_count + 1 }).eq("id", requestedItemId);

  if (parentOffer) {
    await createNotification(supabase, {
      targetUserId: parentOffer.receiver_id,
      notificationType: "offer_received",
      notificationTitle: "وصلك عرض تاني",
      notificationBody: "صاحب العرض بعت اختيار جديد بعد ما فتحت باب تاني.",
      targetItemId: requestedItemId,
      targetOfferId: offer.id,
    });
  } else {
    await createNotification(supabase, {
      targetUserId: requestedItem.owner_id,
      notificationType: "offer_received",
      notificationTitle: "وصلك عرض جديد",
      notificationBody: `فيه حد عرض حاجة على ${requestedItem.title}`,
      targetItemId: requestedItemId,
      targetOfferId: offer.id,
    });
  }

  redirect(`/offers/${offer.id}`);
}
