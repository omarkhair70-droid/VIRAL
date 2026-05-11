"use server";
import { redirect } from "next/navigation";
import { createNotification } from "@/lib/notifications";
import { createClient } from "@/lib/supabase/server";

type ItemCondition = "almost_new" | "good_used" | "minor_issues" | "needs_repair";
type DesireMode = "specific" | "flexible" | "surprise";

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
    const imageUrl = String(formData.get("image_url") || "").trim();
    const description = String(formData.get("description") || "").trim() || null;
    const condition = String(formData.get("condition") || "good_used") as ItemCondition;
    const conditionNotes = String(formData.get("condition_notes") || "").trim() || null;
    const city = String(formData.get("city") || "").trim() || null;
    const area = String(formData.get("area") || "").trim() || null;
    const desireMode = String(formData.get("desire_mode") || "flexible") as DesireMode;
    const desireText = String(formData.get("desire_text") || "").trim() || null;
    const wantedTagsRaw = String(formData.get("wanted_tags") || "").trim();

    if (!title || !condition || !desireMode) redirect(`/offers/new?requestedItemId=${requestedItemId}&error=validation`);
    const { data: newItem } = await supabase.from("items").insert({ owner_id: user.id, status: "active", source: "offer_upload", title, category_id: categoryId, description, condition, condition_notes: conditionNotes, city, area, desire_mode: desireMode, desire_text: desireText }).select("id").single();
    if (!newItem) redirect(`/offers/new?requestedItemId=${requestedItemId}&error=publish`);
    if (imageUrl) await supabase.from("item_images").insert({ item_id: newItem.id, image_url: imageUrl, is_primary: true, sort_order: 0 });
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
