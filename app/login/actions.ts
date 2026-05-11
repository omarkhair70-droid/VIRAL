"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function normalizeNextPath(next: string | null | undefined) {
  if (!next || !next.startsWith("/")) return "/dashboard";
  if (next.startsWith("//")) return "/dashboard";
  return next;
}

async function getBaseUrl() {
  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host");
  const protocol = hdrs.get("x-forwarded-proto") ?? "http";

  if (host) {
    return `${protocol}://${host}`;
  }

  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function sendMagicLink(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "").trim();
  const next = normalizeNextPath(String(formData.get("next") ?? ""));

  if (!email) {
    redirect(`/login?next=${encodeURIComponent(next)}&error=empty_email`);
  }

  const redirectTo = `${await getBaseUrl()}/auth/callback?next=${encodeURIComponent(next)}`;
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo },
  });

  if (error) {
    redirect(`/login?next=${encodeURIComponent(next)}&error=send_failed`);
  }

  redirect(`/login?next=${encodeURIComponent(next)}&sent=1`);
}
