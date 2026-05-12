"use server";
import { notFound, redirect } from "next/navigation";
import { isCurrentUserAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

const VALID_STATUSES = ["new", "reviewed", "planned", "dismissed"] as const;

function getText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function updateFeedbackStatus(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/feedback");
  if (!(await isCurrentUserAdmin(supabase))) notFound();

  const feedbackId = getText(formData, "feedback_id");
  const status = getText(formData, "status");
  const adminNote = getText(formData, "admin_note");
  const statusFilter = getText(formData, "status_filter") || "all";
  const typeFilter = getText(formData, "type_filter") || "all";

  if (!feedbackId || !VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number]) || adminNote.length > 1000) {
    redirect(`/admin/feedback?status=${statusFilter}&type=${typeFilter}&error=invalid_input`);
  }

  const { error } = await supabase.from("feedback").update({ status, admin_note: adminNote || null, reviewed_by: user.id, reviewed_at: new Date().toISOString() }).eq("id", feedbackId);
  if (error) redirect(`/admin/feedback?status=${statusFilter}&type=${typeFilter}&error=update_failed`);
  redirect(`/admin/feedback?status=${statusFilter}&type=${typeFilter}&updated=1`);
}
