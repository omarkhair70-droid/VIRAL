"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createNotification } from "@/lib/notifications";
import { createClient } from "@/lib/supabase/server";

type DealStatus = "coordinating" | "completed_pending_confirmation" | "completed" | "cancelled" | "disputed";

type DealRow = {
  id: string;
  offer_id: string;
  requester_id: string;
  offerer_id: string;
  requested_item_id: string;
  offered_item_id: string;
  status: DealStatus;
};

function isDuplicateError(message: string | undefined): boolean {
  return (message ?? "").toLowerCase().includes("duplicate");
}

async function insertNotificationSafely(
  supabase: Awaited<ReturnType<typeof createClient>>,
  payload: {
    userId: string;
    notificationType: "deal_completed" | "system";
    title: string;
    body: string;
    dealId: string;
  },
) {
  await createNotification(supabase, {
    targetUserId: payload.userId,
    notificationType: payload.notificationType,
    notificationTitle: payload.title,
    notificationBody: payload.body,
    targetDealId: payload.dealId,
  });
}

export async function confirmDealCompleted(formData: FormData) {
  const dealId = String(formData.get("dealId") ?? "").trim();
  if (!dealId) redirect("/deals");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/deals/${dealId}`);

  const { data: dealData } = await supabase
    .from("swap_deals")
    .select("id,offer_id,requester_id,offerer_id,requested_item_id,offered_item_id,status")
    .eq("id", dealId)
    .maybeSingle();

  const deal = dealData as DealRow | null;
  if (!deal) redirect(`/deals/${dealId}?error=not_found`);
  const isParticipant = user.id === deal.requester_id || user.id === deal.offerer_id;
  if (!isParticipant) redirect(`/deals/${dealId}?error=not_allowed`);
  if (!["coordinating", "completed_pending_confirmation"].includes(deal.status)) {
    redirect(`/deals/${dealId}?error=invalid_status`);
  }

  const { error: insertConfirmationError } = await supabase
    .from("deal_confirmations")
    .insert({ deal_id: dealId, user_id: user.id });

  if (insertConfirmationError && !isDuplicateError(insertConfirmationError.message)) {
    redirect(`/deals/${dealId}?error=confirm_failed`);
  }

  const { data: dealCompleted, error: completeRpcError } = await supabase.rpc("complete_deal_if_ready", { p_deal_id: dealId });
  if (completeRpcError) {
    redirect(`/deals/${dealId}?error=confirm_failed`);
  }

  if (dealCompleted) {
    await Promise.all([
      insertNotificationSafely(supabase, { userId: deal.requester_id, notificationType: "deal_completed", title: "المقايضة تمت", body: "الطرفين أكدوا الإتمام. تقدروا تسيبوا تقييم لبعض.", dealId: dealId }),
      insertNotificationSafely(supabase, { userId: deal.offerer_id, notificationType: "deal_completed", title: "المقايضة تمت", body: "الطرفين أكدوا الإتمام. تقدروا تسيبوا تقييم لبعض.", dealId: dealId }),
    ]);
  } else {
    const otherParticipantId = user.id === deal.requester_id ? deal.offerer_id : deal.requester_id;
    await insertNotificationSafely(supabase, {
      userId: otherParticipantId,
      notificationType: "system",
      title: "الصفقة مستنية تأكيدك",
      body: "الطرف التاني أكد إن المقايضة تمت. راجع الصفقة وأكد لما تكون جاهز.",
      dealId: dealId,
    });
  }

  revalidatePath(`/deals/${dealId}`);
  revalidatePath("/deals");
  revalidatePath("/dashboard");
  redirect(`/deals/${dealId}?updated=confirmed`);
}

export async function submitDealReview(formData: FormData) {
  const dealId = String(formData.get("dealId") ?? "").trim();
  const ratingValue = Number(formData.get("rating"));
  const commentInput = String(formData.get("comment") ?? "").trim();
  const comment = commentInput.length > 0 ? commentInput.slice(0, 300) : null;

  if (!dealId) redirect("/deals");
  if (!Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 5) {
    redirect(`/deals/${dealId}?error=invalid_rating`);
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/deals/${dealId}`);

  const { data: dealData } = await supabase
    .from("swap_deals")
    .select("id,requester_id,offerer_id,status")
    .eq("id", dealId)
    .maybeSingle();

  const deal = dealData as Pick<DealRow, "id" | "requester_id" | "offerer_id" | "status"> | null;
  if (!deal) redirect(`/deals/${dealId}?error=not_found`);
  if (deal.status !== "completed") redirect(`/deals/${dealId}?error=review_not_ready`);

  const isParticipant = user.id === deal.requester_id || user.id === deal.offerer_id;
  if (!isParticipant) redirect(`/deals/${dealId}?error=not_allowed`);

  const revieweeId = user.id === deal.requester_id ? deal.offerer_id : deal.requester_id;
  if (revieweeId === user.id) redirect(`/deals/${dealId}?error=not_allowed`);

  const { error } = await supabase.from("reviews").insert({
    deal_id: dealId,
    reviewer_id: user.id,
    reviewee_id: revieweeId,
    rating: ratingValue,
    comment,
  });

  if (error) {
    if (isDuplicateError(error.message)) {
      redirect(`/deals/${dealId}?error=already_reviewed`);
    }
    redirect(`/deals/${dealId}?error=review_failed`);
  }

  await insertNotificationSafely(supabase, {
    userId: revieweeId,
    notificationType: "system",
    title: "وصلك تقييم جديد",
    body: "فيه تقييم جديد ظهر على بروفايلك بعد المقايضة.",
    dealId: dealId,
  });

  revalidatePath(`/deals/${dealId}`);
  revalidatePath("/users/[username]", "page");
  redirect(`/deals/${dealId}?reviewed=1`);
}


export async function sendDealMessage(formData: FormData) {
  const dealId = String(formData.get("dealId") ?? "").trim();
  const bodyValue = String(formData.get("body") ?? "").trim();

  if (!dealId) redirect("/deals");
  if (!bodyValue) redirect(`/deals/${dealId}?messageError=empty#messages`);
  if (bodyValue.length > 800) redirect(`/deals/${dealId}?messageError=too_long#messages`);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/deals/${dealId}`);

  const { data: dealData } = await supabase
    .from("swap_deals")
    .select("id,requester_id,offerer_id,status")
    .eq("id", dealId)
    .maybeSingle();

  const deal = dealData as Pick<DealRow, "id" | "requester_id" | "offerer_id" | "status"> | null;
  const canSend =
    !!deal
    && (user.id === deal.requester_id || user.id === deal.offerer_id)
    && (deal.status === "coordinating" || deal.status === "completed_pending_confirmation");

  if (!canSend) {
    redirect(`/deals/${dealId}?messageError=not_allowed#messages`);
  }

  const oneMinuteAgoIso = new Date(Date.now() - 60 * 1000).toISOString();
  const { count: recentMessagesCount } = await supabase
    .from("deal_messages")
    .select("id", { count: "exact", head: true })
    .eq("deal_id", dealId)
    .eq("sender_id", user.id)
    .gte("created_at", oneMinuteAgoIso);

  if ((recentMessagesCount ?? 0) >= 5) {
    redirect(`/deals/${dealId}?messageError=rate_limited#messages`);
  }

  const { error: insertError } = await supabase.from("deal_messages").insert({
    deal_id: dealId,
    sender_id: user.id,
    body: bodyValue,
  });

  if (insertError) {
    redirect(`/deals/${dealId}?messageError=send_failed#messages`);
  }

  const recipientId = user.id === deal.requester_id ? deal.offerer_id : deal.requester_id;
  if (recipientId && recipientId !== user.id) {
    await insertNotificationSafely(supabase, {
      userId: recipientId,
      notificationType: "system",
      title: "رسالة جديدة في الصفقة",
      body: "الطرف التاني بعت رسالة في صفحة التنسيق.",
      dealId,
    });
  }

  revalidatePath(`/deals/${dealId}`);
  redirect(`/deals/${dealId}?message=sent#messages`);
}
