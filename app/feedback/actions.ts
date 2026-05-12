"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
const FEEDBACK_TYPES = ["bug", "idea", "confusion", "praise", "other"] as const;
function getText(formData: FormData, key: string): string { const value = formData.get(key); return typeof value === "string" ? value.trim() : ""; }
export async function submitFeedback(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/feedback");
  const feedbackType = getText(formData, "feedback_type");
  const subject = getText(formData, "subject");
  const details = getText(formData, "details");
  const pagePath = getText(formData, "page_path");
  if (!FEEDBACK_TYPES.includes(feedbackType as (typeof FEEDBACK_TYPES)[number])) redirect("/feedback?error=invalid_type");
  if (!subject || subject.length > 120 || details.length > 1000 || pagePath.length > 300) redirect("/feedback?error=invalid_input");
  const { error } = await supabase.from("feedback").insert({ user_id: user.id, feedback_type: feedbackType, subject, details: details || null, page_path: pagePath || null });
  if (error) redirect("/feedback?error=submit_failed");
  redirect("/feedback?sent=1");
}
