"use server";
import { redirect } from "next/navigation";
import { createNotification } from "@/lib/notifications";
import { createClient } from "@/lib/supabase/server";

type ItemCondition = "almost_new" | "good_used" | "minor_issues" | "needs_repair";
type DesireMode = "specific" | "flexible" | "surprise";

export async function createOffer(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const requestedItemId = String(formData.get("requested_item_id") || "").trim();
  if (!user) redirect(`/login?next=/offers/new?requestedItemId=${encodeURIComponent(requestedItemId)}`);
  if (!requestedItemId) redirect("/offers/new?error=missing_requested");

  const { data: requestedItem } = await supabase.from("items").select("id,owner_id,status,title,offer_count").eq("id", requestedItemId).maybeSingle();
  if (!requestedItem || requestedItem.status !== "active") redirect(`/offers/new?requestedItemId=${requestedItemId}&error=unavailable`);
  if (requestedItem.owner_id === user.id) redirect(`/offers/new?requestedItemId=${requestedItemId}&error=own_item`);

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
  const { data: offer } = await supabase.from("offers").insert({ requested_item_id: requestedItemId, offered_item_id: offeredItemId, sender_id: user.id, receiver_id: requestedItem.owner_id, status: "pending", message }).select("id").single();
  if (!offer) redirect(`/offers/new?requestedItemId=${requestedItemId}&error=offer_failed`);
  await supabase.from("offer_events").insert({ offer_id: offer.id, actor_id: user.id, event_type: "created", old_status: null, new_status: "pending", note: null });
  if (typeof requestedItem.offer_count === "number") await supabase.from("items").update({ offer_count: requestedItem.offer_count + 1 }).eq("id", requestedItemId);
  await createNotification(supabase, {
    targetUserId: requestedItem.owner_id,
    notificationType: "offer_received",
    notificationTitle: "وصلك عرض جديد",
    notificationBody: `فيه حد عرض حاجة على ${requestedItem.title}`,
    targetItemId: requestedItemId,
    targetOfferId: offer.id,
  });
  redirect(`/offers/${offer.id}`);
}
