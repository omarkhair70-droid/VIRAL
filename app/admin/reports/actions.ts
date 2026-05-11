"use server";

import { notFound, redirect } from "next/navigation";
import { isCurrentUserAdmin } from "@/lib/admin";
import { createNotification } from "@/lib/notifications";
import { createClient } from "@/lib/supabase/server";

const VALID_STATUSES = ["open", "reviewing", "resolved", "dismissed"] as const;
const VALID_STATUS_FILTERS = ["all", ...VALID_STATUSES] as const;
const VALID_REASON_FILTERS = ["all", "misleading_item", "inappropriate_content", "spam_offer", "unsafe_behavior", "no_show", "other"] as const;

const reportStatusBodyMap: Record<(typeof VALID_STATUSES)[number], string> = {
  open: "تم رجوع البلاغ لحالة مفتوح.",
  reviewing: "بلاغك تحت المراجعة.",
  resolved: "تم التعامل مع البلاغ.",
  dismissed: "تم إغلاق البلاغ بعد المراجعة.",
};

function getText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getFilterValue(value: string, allowed: readonly string[]): string {
  return allowed.includes(value) ? value : "all";
}

function buildRedirectPath(status: string, reason: string, outcome: "updated" | "error"): string {
  const params = new URLSearchParams();
  if (status !== "all") params.set("status", status);
  if (reason !== "all") params.set("reason", reason);
  params.set(outcome === "updated" ? "updated" : "error", outcome === "updated" ? "1" : "update_failed");
  return `/admin/reports?${params.toString()}`;
}

export async function updateReportStatus(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/admin/reports");
  if (!(await isCurrentUserAdmin(supabase))) notFound();

  const reportId = getText(formData, "report_id");
  const nextStatus = getText(formData, "status");
  const statusFilter = getFilterValue(getText(formData, "status_filter"), VALID_STATUS_FILTERS);
  const reasonFilter = getFilterValue(getText(formData, "reason_filter"), VALID_REASON_FILTERS);

  if (!reportId || !VALID_STATUSES.includes(nextStatus as (typeof VALID_STATUSES)[number])) {
    redirect(buildRedirectPath(statusFilter, reasonFilter, "error"));
  }

  const { data: report, error } = await supabase
    .from("reports")
    .update({ status: nextStatus })
    .eq("id", reportId)
    .select("reporter_id,item_id,offer_id,deal_id")
    .maybeSingle();
  if (error || !report) redirect(buildRedirectPath(statusFilter, reasonFilter, "error"));

  await createNotification(supabase, {
    targetUserId: report.reporter_id,
    notificationType: "report_update",
    notificationTitle: "تم تحديث حالة بلاغك",
    notificationBody: reportStatusBodyMap[nextStatus as (typeof VALID_STATUSES)[number]],
    targetItemId: report.item_id,
    targetOfferId: report.offer_id,
    targetDealId: report.deal_id,
  });

  redirect(buildRedirectPath(statusFilter, reasonFilter, "updated"));
}
