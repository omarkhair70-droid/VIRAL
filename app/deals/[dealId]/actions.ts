"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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
  supabase: Awaited<ReturnType<typeof createClient>> ,
  payload: {
    user_id: string;
    type: "deal_completed" | "system";
    title: string;
    body: string;
    deal_id: string;
  },
) {
  const { error } = await supabase.from("notifications").insert(payload);
  if (error) console.error("notification insert skipped", error.message);
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

  const { count: confirmationsCount } = await supabase
    .from("deal_confirmations")
    .select("id", { count: "exact", head: true })
    .eq("deal_id", dealId);

  if ((confirmationsCount ?? 0) >= 2) {
    const { data: completedUpdate, error: completeError } = await supabase
      .from("swap_deals")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", dealId)
      .in("status", ["coordinating", "completed_pending_confirmation"])
      .select("id")
      .maybeSingle();

    if (completeError) redirect(`/deals/${dealId}?error=confirm_failed`);

    if (completedUpdate) {
      await supabase.from("items").update({ status: "swapped" }).in("id", [deal.requested_item_id, deal.offered_item_id]);
      await supabase.from("offer_events").insert({ offer_id: deal.offer_id, actor_id: user.id, event_type: "completed", old_status: "accepted", new_status: "accepted" });
      await supabase.rpc("increment_successful_swaps_for_users", { user_a: deal.requester_id, user_b: deal.offerer_id });
      await Promise.all([
        insertNotificationSafely(supabase, { user_id: deal.requester_id, type: "deal_completed", title: "المقايضة تمت", body: "الطرفين أكدوا الإتمام. تقدروا تسيبوا تقييم لبعض.", deal_id: dealId }),
        insertNotificationSafely(supabase, { user_id: deal.offerer_id, type: "deal_completed", title: "المقايضة تمت", body: "الطرفين أكدوا الإتمام. تقدروا تسيبوا تقييم لبعض.", deal_id: dealId }),
      ]);
    }
  } else {
    await supabase
      .from("swap_deals")
      .update({ status: "completed_pending_confirmation" })
      .eq("id", dealId)
      .eq("status", "coordinating");

    const otherParticipantId = user.id === deal.requester_id ? deal.offerer_id : deal.requester_id;
    await insertNotificationSafely(supabase, {
      user_id: otherParticipantId,
      type: "system",
      title: "الصفقة مستنية تأكيدك",
      body: "الطرف التاني أكد إن المقايضة تمت. راجع الصفقة وأكد لما تكون جاهز.",
      deal_id: dealId,
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
    user_id: revieweeId,
    type: "system",
    title: "وصلك تقييم جديد",
    body: "فيه تقييم جديد ظهر على بروفايلك بعد المقايضة.",
    deal_id: dealId,
  });

  revalidatePath(`/deals/${dealId}`);
  revalidatePath("/users/[username]", "page");
  redirect(`/deals/${dealId}?reviewed=1`);
}
