"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { normalizeNextPath } from "@/lib/normalize-next-path";

const VALID_REASONS = new Set(["misleading_item", "inappropriate_content", "spam_offer", "unsafe_behavior", "no_show", "other"]);
const MESSAGE_REASONS = new Set(["inappropriate_content", "spam_offer", "unsafe_behavior", "other"]);

function getText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function normalizeReturnTo(value: string): string {
  return normalizeNextPath(value, "/safety");
}

function buildSuccessRedirect(returnTo: string): string {
  return `${returnTo}${returnTo.includes("?") ? "&" : "?"}reported=1`;
}

function buildErrorRedirect(path: string, code: string): string {
  return `${path}${path.includes("?") ? "&" : "?"}error=${encodeURIComponent(code)}`;
}

export async function createReport(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const itemId = getText(formData, "item_id");
  const offerId = getText(formData, "offer_id");
  const dealId = getText(formData, "deal_id");
  const reportedUserId = getText(formData, "reported_user_id");
  const dealMessageId = getText(formData, "deal_message_id");
  const reason = getText(formData, "reason");
  const details = getText(formData, "details");
  const returnTo = normalizeReturnTo(getText(formData, "returnTo"));

  const reportParams = new URLSearchParams();
  if (itemId) reportParams.set("itemId", itemId);
  if (offerId) reportParams.set("offerId", offerId);
  if (dealId) reportParams.set("dealId", dealId);
  if (reportedUserId) reportParams.set("userId", reportedUserId);
  if (dealMessageId) reportParams.set("messageId", dealMessageId);
  reportParams.set("returnTo", returnTo);
  const reportPath = `/report?${reportParams.toString()}`;

  if (!user) redirect(`/login?next=${encodeURIComponent(reportPath)}`);

  if ([itemId, offerId, dealId, reportedUserId, dealMessageId].filter(Boolean).length !== 1) redirect(buildErrorRedirect(reportPath, "missing_target"));
  if (!VALID_REASONS.has(reason)) redirect(buildErrorRedirect(reportPath, "invalid_reason"));
  if (details.length > 500) redirect(buildErrorRedirect(reportPath, "submit_failed"));

  let derivedReportedUserId: string | null = null;
  let derivedDealId = dealId || null;
  let derivedMessageId: string | null = null;

  if (dealMessageId) {
    if (!MESSAGE_REASONS.has(reason)) redirect(buildErrorRedirect(reportPath, "invalid_reason"));
    const { data: message } = await supabase
      .from("deal_messages")
      .select("id,deal_id,sender_id,swap_deals!inner(requester_id,offerer_id)")
      .eq("id", dealMessageId)
      .maybeSingle();

    const deal = Array.isArray(message?.swap_deals) ? message.swap_deals[0] : message?.swap_deals;
    const isParticipant = !!deal && (deal.requester_id === user.id || deal.offerer_id === user.id);
    if (!message || !deal || !isParticipant) redirect(buildErrorRedirect(reportPath, "invalid_message"));
    if (message.sender_id === user.id) redirect(buildErrorRedirect(reportPath, "own_message"));

    derivedMessageId = message.id;
    derivedDealId = message.deal_id;
    derivedReportedUserId = message.sender_id;
  }

  if (itemId) {
    const { data: item } = await supabase.from("items").select("id,owner_id,status").eq("id", itemId).maybeSingle();
    if (!item || item.status === "removed" || item.owner_id === user.id) redirect(buildErrorRedirect(reportPath, "not_allowed"));
    derivedReportedUserId = item.owner_id;
  }
  if (offerId) {
    const { data: offer } = await supabase.from("offers").select("id,sender_id,receiver_id").eq("id", offerId).maybeSingle();
    if (!offer || (offer.sender_id !== user.id && offer.receiver_id !== user.id)) redirect(buildErrorRedirect(reportPath, "not_allowed"));
    derivedReportedUserId = offer.sender_id === user.id ? offer.receiver_id : offer.sender_id;
  }
  if (dealId && !dealMessageId) {
    const { data: deal } = await supabase.from("swap_deals").select("id,requester_id,offerer_id").eq("id", dealId).maybeSingle();
    if (!deal || (deal.requester_id !== user.id && deal.offerer_id !== user.id)) redirect(buildErrorRedirect(reportPath, "not_allowed"));
    derivedReportedUserId = deal.requester_id === user.id ? deal.offerer_id : deal.requester_id;
  }
  if (reportedUserId) {
    if (reportedUserId === user.id) redirect(buildErrorRedirect(reportPath, "not_allowed"));
    const { data: profile } = await supabase.from("profiles").select("id").eq("id", reportedUserId).maybeSingle();
    if (!profile) redirect(buildErrorRedirect(reportPath, "not_allowed"));
    derivedReportedUserId = profile.id;
  }

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    reported_user_id: derivedReportedUserId,
    item_id: itemId || null,
    offer_id: offerId || null,
    deal_id: derivedDealId,
    deal_message_id: derivedMessageId,
    reason,
    details: details || null,
  });

  if (error) redirect(buildErrorRedirect(reportPath, "submit_failed"));
  redirect(buildSuccessRedirect(returnTo));
}
