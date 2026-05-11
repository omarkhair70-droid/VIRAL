"use server";

import { redirect } from "next/navigation";
import { createNotification } from "@/lib/notifications";
import { createClient } from "@/lib/supabase/server";

type OfferStatus = "pending" | "thinking" | "accepted" | "soft_rejected" | "redirected" | "withdrawn" | "expired" | "cancelled_after_accept";
type RedirectType = "offer_another_item" | "ask_for_different_item" | "update_preferences";

type OfferCore = {
  id: string;
  status: OfferStatus;
  sender_id: string;
  receiver_id: string;
  requested_item_id: string;
  offered_item_id: string;
};

const RESPONDABLE = new Set<OfferStatus>(["pending", "thinking"]);

async function validateOfferResponse(formData: FormData) {
  const offerId = String(formData.get("offerId") ?? "").trim();
  if (!offerId) redirect("/feed?error=response_failed");

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) redirect(`/login?next=/offers/${offerId}`);

  const { data: offer } = await supabase
    .from("offers")
    .select("id,status,sender_id,receiver_id,requested_item_id,offered_item_id")
    .eq("id", offerId)
    .maybeSingle();

  if (!offer) redirect(`/offers/${offerId}?error=response_failed`);
  const row = offer as OfferCore;
  if (user.id !== row.receiver_id) redirect(`/offers/${offerId}?error=not_allowed`);
  if (!RESPONDABLE.has(row.status)) redirect(`/offers/${offerId}?error=invalid_status`);

  return { supabase, userId: user.id, offerId, offer: row };
}

async function insertEventAndNotify(params: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  offerId: string;
  userId: string;
  oldStatus: OfferStatus;
  newStatus: OfferStatus;
  eventType: "marked_thinking" | "accepted" | "soft_rejected" | "redirected";
  note?: string;
  senderId: string;
  notificationType: "offer_thinking" | "offer_accepted" | "offer_soft_rejected" | "offer_redirected";
  notificationTitle: string;
  notificationBody: string;
}) {
  const { supabase } = params;
  const { error: eventError } = await supabase.from("offer_events").insert({
    offer_id: params.offerId,
    actor_id: params.userId,
    event_type: params.eventType,
    old_status: params.oldStatus,
    new_status: params.newStatus,
    note: params.note?.trim() ? params.note.trim() : null,
  });
  if (eventError) throw eventError;

  await createNotification(supabase, {
    targetUserId: params.senderId,
    notificationType: params.notificationType,
    notificationTitle: params.notificationTitle,
    notificationBody: params.notificationBody,
    targetOfferId: params.offerId,
  });
}

export async function markOfferThinking(formData: FormData) {
  try {
    const ctx = await validateOfferResponse(formData);
    const note = String(formData.get("note") ?? "");
    const { error } = await ctx.supabase.from("offers").update({ status: "thinking", responded_at: new Date().toISOString() }).eq("id", ctx.offerId);
    if (error) throw error;
    await insertEventAndNotify({
      supabase: ctx.supabase,
      offerId: ctx.offerId,
      userId: ctx.userId,
      oldStatus: ctx.offer.status,
      newStatus: "thinking",
      eventType: "marked_thinking",
      note,
      senderId: ctx.offer.sender_id,
      notificationType: "offer_thinking",
      notificationTitle: "صاحب الحاجة محتاج يفكر",
      notificationBody: "العرض لسه مفتوح، بس محتاج وقت.",
    });
    redirect(`/offers/${ctx.offerId}?response=thinking`);
  } catch (error) {
    console.error("markOfferThinking failed", error);
    const offerId = String(formData.get("offerId") ?? "").trim();
    redirect(offerId ? `/offers/${offerId}?error=response_failed` : "/feed?error=response_failed");
  }
}

export async function acceptOffer(formData: FormData) {
  try {
    const ctx = await validateOfferResponse(formData);
    const note = String(formData.get("note") ?? "");
    const { error } = await ctx.supabase.from("offers").update({ status: "accepted", responded_at: new Date().toISOString() }).eq("id", ctx.offerId);
    if (error) throw error;
    await insertEventAndNotify({
      supabase: ctx.supabase,
      offerId: ctx.offerId,
      userId: ctx.userId,
      oldStatus: ctx.offer.status,
      newStatus: "accepted",
      eventType: "accepted",
      note,
      senderId: ctx.offer.sender_id,
      notificationType: "offer_accepted",
      notificationTitle: "العرض اتقبل",
      notificationBody: "صاحب الحاجة قبل العرض.",
    });

    const { data: existingDeal, error: existingDealError } = await ctx.supabase
      .from("swap_deals")
      .select("id")
      .eq("offer_id", ctx.offer.id)
      .maybeSingle();
    if (existingDealError) throw existingDealError;

    if (!existingDeal) {
      const { data: createdDeal, error: dealInsertError } = await ctx.supabase.from("swap_deals").insert({
        offer_id: ctx.offer.id,
        requested_item_id: ctx.offer.requested_item_id,
        offered_item_id: ctx.offer.offered_item_id,
        requester_id: ctx.offer.receiver_id,
        offerer_id: ctx.offer.sender_id,
        status: "coordinating",
      }).select("id").single();
      if (dealInsertError) throw dealInsertError;

      if (createdDeal?.id) {
        await Promise.all([
          createNotification(ctx.supabase, {
            targetUserId: ctx.offer.sender_id,
            notificationType: "deal_created",
            notificationTitle: "اتفتحت صفحة التنسيق",
            notificationBody: "العرض اتقبل، وكده تقدروا تتابعوا الصفقة من صفحة التنسيق.",
            targetOfferId: ctx.offer.id,
            targetDealId: createdDeal.id,
          }),
          createNotification(ctx.supabase, {
            targetUserId: ctx.offer.receiver_id,
            notificationType: "deal_created",
            notificationTitle: "اتفتحت صفحة التنسيق",
            notificationBody: "العرض اتقبل، وكده تقدروا تتابعوا الصفقة من صفحة التنسيق.",
            targetOfferId: ctx.offer.id,
            targetDealId: createdDeal.id,
          }),
        ]);
      }
    }

    redirect(`/offers/${ctx.offerId}?response=accepted`);
  } catch (error) {
    console.error("acceptOffer failed", error);
    const offerId = String(formData.get("offerId") ?? "").trim();
    redirect(offerId ? `/offers/${offerId}?error=response_failed` : "/feed?error=response_failed");
  }
}

export async function softRejectOffer(formData: FormData) {
  try {
    const ctx = await validateOfferResponse(formData);
    const note = String(formData.get("note") ?? "");
    const { error } = await ctx.supabase.from("offers").update({ status: "soft_rejected", responded_at: new Date().toISOString(), public_note: note.trim() ? note.trim() : null }).eq("id", ctx.offerId);
    if (error) throw error;
    await insertEventAndNotify({
      supabase: ctx.supabase,
      offerId: ctx.offerId,
      userId: ctx.userId,
      oldStatus: ctx.offer.status,
      newStatus: "soft_rejected",
      eventType: "soft_rejected",
      note,
      senderId: ctx.offer.sender_id,
      notificationType: "offer_soft_rejected",
      notificationTitle: "العرض ما ظبطش المرة دي",
      notificationBody: "صاحب الحاجة رفض العرض بلطف.",
    });
    redirect(`/offers/${ctx.offerId}?response=soft_rejected`);
  } catch (error) {
    console.error("softRejectOffer failed", error);
    const offerId = String(formData.get("offerId") ?? "").trim();
    redirect(offerId ? `/offers/${offerId}?error=response_failed` : "/feed?error=response_failed");
  }
}

export async function redirectOffer(formData: FormData) {
  const redirectType = String(formData.get("redirectType") ?? "") as RedirectType;
  if (!["offer_another_item", "ask_for_different_item", "update_preferences"].includes(redirectType)) {
    const offerId = String(formData.get("offerId") ?? "").trim();
    redirect(offerId ? `/offers/${offerId}?error=invalid_redirect_type` : "/feed?error=invalid_redirect_type");
  }
  try {
    const ctx = await validateOfferResponse(formData);
    const note = String(formData.get("note") ?? "");
    const { error } = await ctx.supabase.from("offers").update({ status: "redirected", responded_at: new Date().toISOString(), redirect_type: redirectType, public_note: note.trim() ? note.trim() : null }).eq("id", ctx.offerId);
    if (error) throw error;
    await insertEventAndNotify({
      supabase: ctx.supabase,
      offerId: ctx.offerId,
      userId: ctx.userId,
      oldStatus: ctx.offer.status,
      newStatus: "redirected",
      eventType: "redirected",
      note,
      senderId: ctx.offer.sender_id,
      notificationType: "offer_redirected",
      notificationTitle: "صاحب الحاجة فتح باب تاني",
      notificationBody: "العرض الحالي مش مناسب، بس فيه احتمال لعرض مختلف.",
    });
    redirect(`/offers/${ctx.offerId}?response=redirected`);
  } catch (error) {
    console.error("redirectOffer failed", error);
    const offerId = String(formData.get("offerId") ?? "").trim();
    redirect(offerId ? `/offers/${offerId}?error=response_failed` : "/feed?error=response_failed");
  }
}
