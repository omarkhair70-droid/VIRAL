"use server";

import { redirect } from "next/navigation";
import { normalizeNextPath } from "@/lib/normalize-next-path";
import { createClient } from "@/lib/supabase/server";

const USERNAME_REGEX = /^[a-z0-9_-]+$/;

function getText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function setupErrorRedirect(message: string, next: string): never {
  redirect(`/profile/setup?next=${encodeURIComponent(next)}&error=${encodeURIComponent(message)}`);
}

export async function completeProfileSetup(formData: FormData): Promise<void> {
  const next = normalizeNextPath(getText(formData, "next"));
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?next=${encodeURIComponent(`/profile/setup?next=${next}`)}`);

  const displayName = getText(formData, "display_name");
  const username = getText(formData, "username").toLowerCase();
  const city = getText(formData, "city");
  const area = getText(formData, "area");
  const bio = getText(formData, "bio");

  if (displayName.length < 2 || displayName.length > 60) setupErrorRedirect("الاسم لازم يكون بين 2 و60 حرف.", next);
  if (username.length < 3 || username.length > 30 || !USERNAME_REGEX.test(username)) {
    setupErrorRedirect("اسم المستخدم لازم يكون 3-30 حرف وبحروف صغيرة أو أرقام أو _ أو -.", next);
  }
  if (bio.length > 200) setupErrorRedirect("النبذة قصيرة: لحد 200 حرف.", next);
  if (city.length > 60) setupErrorRedirect("المدينة لحد 60 حرف.", next);
  if (area.length > 60) setupErrorRedirect("المنطقة لحد 60 حرف.", next);

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      display_name: displayName,
      username,
      city: city || null,
      area: area || null,
      bio: bio || null,
    },
    { onConflict: "id" },
  );

  if (error?.code === "23505") setupErrorRedirect("اسم المستخدم ده مستخدم قبل كده.", next);
  if (error) setupErrorRedirect("مش قادرين نحفظ بروفايلك دلوقتي. جرّب تاني.", next);

  redirect(next);
}
