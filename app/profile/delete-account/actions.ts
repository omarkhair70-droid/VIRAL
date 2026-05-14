"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function getText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function errorRedirect(message: string): never {
  redirect(`/profile/delete-account?error=${encodeURIComponent(message)}`);
}

export async function submitAuthenticatedAccountDeletionRequest(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/profile/delete-account");

  const requestNote = getText(formData, "request_note");
  if (requestNote.length > 1000) errorRedirect("الملاحظة يجب ألا تتجاوز 1000 حرف.");
  if (!user.email) errorRedirect("لا يوجد بريد مرتبط بالحساب. حدّث الحساب أولًا ثم أعد المحاولة.");

  const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).maybeSingle();
  const { error } = await supabase.from("account_deletion_requests").insert({ user_id: user.id, email: user.email, username: profile?.username ?? null, request_note: requestNote || null, request_source: "authenticated_profile", status: "pending" });

  if (error) errorRedirect("تعذر إرسال الطلب الآن. حاول مرة أخرى.");

  redirect("/profile/delete-account?submitted=1");
}
