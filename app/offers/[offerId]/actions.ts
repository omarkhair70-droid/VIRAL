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

async function notifyOfferResponse(params: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  offerId: string;
  senderId: string;
  notificationType: "offer_thinking" | "offer_soft_rejected" | "offer_redirected";
  notificationTitle: string;
  notificationBody: string;
}) {
  await createNotification(params.supabase, {
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
    const { error } = await ctx.supabase.rpc("mark_offer_thinking", { p_offer_id: ctx.offerId, p_note: note });
    if (error) throw error;

    await notifyOfferResponse({
      supabase: ctx.supabase,
      offerId: ctx.offerId,
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

    const { data: dealId, error: rpcError } = await ctx.supabase.rpc("accept_offer", { p_offer_id: ctx.offerId });
    if (rpcError) throw rpcError;

    if (dealId) {
      await Promise.all([
        createNotification(ctx.supabase, {
          targetUserId: ctx.offer.sender_id,
          notificationType: "offer_accepted",
          notificationTitle: "العرض اتقبل",
          notificationBody: "صاحب الحاجة قبل العرض.",
          targetOfferId: ctx.offer.id,
          targetDealId: dealId,
        }),
        createNotification(ctx.supabase, {
          targetUserId: ctx.offer.sender_id,
          notificationType: "deal_created",
          notificationTitle: "اتفتحت صفحة التنسيق",
          notificationBody: "العرض اتقبل، وكده تقدروا تتابعوا الصفقة من صفحة التنسيق.",
          targetOfferId: ctx.offer.id,
          targetDealId: dealId,
        }),
        createNotification(ctx.supabase, {
          targetUserId: ctx.offer.receiver_id,
          notificationType: "deal_created",
          notificationTitle: "اتفتحت صفحة التنسيق",
          notificationBody: "العرض اتقبل، وكده تقدروا تتابعوا الصفقة من صفحة التنسيق.",
          targetOfferId: ctx.offer.id,
          targetDealId: dealId,
        }),
      ]);
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
    const { error } = await ctx.supabase.rpc("soft_reject_offer", { p_offer_id: ctx.offerId, p_note: note });
    if (error) throw error;

    await notifyOfferResponse({
      supabase: ctx.supabase,
      offerId: ctx.offerId,
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
    const { error } = await ctx.supabase.rpc("redirect_offer", {
      p_offer_id: ctx.offerId,
      p_redirect_type: redirectType,
      p_note: note,
    });
    if (error) throw error;

    await notifyOfferResponse({
      supabase: ctx.supabase,
      offerId: ctx.offerId,
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
