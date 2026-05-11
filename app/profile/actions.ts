"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const USERNAME_REGEX = /^[a-z0-9_-]+$/;

function getText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function errorRedirect(message: string): never {
  redirect(`/profile?error=${encodeURIComponent(message)}`);
}

export async function updateProfile(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/profile");

  const displayName = getText(formData, "display_name");
  const username = getText(formData, "username").toLowerCase();
  const city = getText(formData, "city");
  const area = getText(formData, "area");
  const bio = getText(formData, "bio");
  const avatarUrl = getText(formData, "avatar_url");

  if (displayName.length < 2 || displayName.length > 60) errorRedirect("الاسم لازم يكون بين 2 و60 حرف.");
  if (username.length < 3 || username.length > 30 || !USERNAME_REGEX.test(username)) errorRedirect("اسم المستخدم لازم يكون 3-30 حرف وبحروف صغيرة أو أرقام أو _ أو -.");
  if (bio.length > 200) errorRedirect("النبذة قصيرة: لحد 200 حرف.");
  if (city.length > 60) errorRedirect("المدينة لحد 60 حرف.");
  if (area.length > 60) errorRedirect("المنطقة لحد 60 حرف.");
  if (avatarUrl.length > 500) errorRedirect("رابط الصورة طويل جدًا.");

  if (avatarUrl) {
    try {
      new URL(avatarUrl);
    } catch {
      errorRedirect("رابط الصورة مش صحيح.");
    }
  }

  const payload = {
    id: user.id,
    display_name: displayName,
    username,
    city: city || null,
    area: area || null,
    bio: bio || null,
    avatar_url: avatarUrl || null,
  };

  const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });

  if (error?.code === "23505") errorRedirect("اسم المستخدم ده مستخدم قبل كده.");
  if (error) errorRedirect("مش قادرين نحفظ بروفايلك دلوقتي. جرّب تاني.");

  redirect("/profile?updated=1");
}
