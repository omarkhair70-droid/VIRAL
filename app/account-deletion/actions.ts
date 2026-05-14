"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function errorRedirect(message: string): never {
  redirect(`/account-deletion?error=${encodeURIComponent(message)}`);
}

export async function submitPublicAccountDeletionRequest(formData: FormData): Promise<void> {
  const website = getText(formData, "website");
  if (website) redirect("/account-deletion?submitted=1");

  const email = getText(formData, "email").toLowerCase();
  const username = getText(formData, "username");
  const requestNote = getText(formData, "request_note");

  if (!email || email.length > 160 || !EMAIL_REGEX.test(email)) errorRedirect("يرجى إدخال بريد إلكتروني صحيح.");
  if (username.length > 50) errorRedirect("اسم المستخدم يجب ألا يتجاوز 50 حرفًا.");
  if (requestNote.length > 1000) errorRedirect("الملاحظة يجب ألا تتجاوز 1000 حرف.");

  const supabase = await createClient();
  const { error } = await supabase.from("account_deletion_requests").insert({ user_id: null, email, username: username || null, request_note: requestNote || null, request_source: "public_web", status: "pending" });
  if (error) errorRedirect("تعذر إرسال الطلب الآن. حاول مرة أخرى.");

  redirect("/account-deletion?submitted=1");
}
