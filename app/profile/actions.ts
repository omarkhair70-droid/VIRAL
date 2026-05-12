"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const USERNAME_REGEX = /^[a-z0-9_-]+$/;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const AVATAR_MAX_SIZE = 3 * 1024 * 1024;
const COVER_MAX_SIZE = 5 * 1024 * 1024;

function getText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getOptionalFile(formData: FormData, key: string): File | null {
  const value = formData.get(key);
  if (!(value instanceof File) || value.size === 0) return null;
  return value;
}

function errorRedirect(message: string): never {
  redirect(`/profile?error=${encodeURIComponent(message)}`);
}

async function uploadProfileImage(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, file: File, kind: "avatar" | "cover"): Promise<string> {
  if (!IMAGE_TYPES.has(file.type)) errorRedirect("نوع الصورة لازم JPG أو PNG أو WEBP.");
  const maxSize = kind === "avatar" ? AVATAR_MAX_SIZE : COVER_MAX_SIZE;
  if (file.size > maxSize) errorRedirect(kind === "avatar" ? "صورة الأفاتار لازم تكون أقل من 3MB." : "صورة الغلاف لازم تكون أقل من 5MB.");

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `profiles/${userId}/${kind}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("profile-images").upload(path, file, { upsert: true, contentType: file.type });
  if (error) errorRedirect("مش قادرين نرفع الصورة دلوقتي. جرّب تاني.");
  const { data } = supabase.storage.from("profile-images").getPublicUrl(path);
  return data.publicUrl;
}

export async function updateProfile(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/profile");

  const displayName = getText(formData, "display_name");
  const username = getText(formData, "username").toLowerCase();
  const profileTagline = getText(formData, "profile_tagline");
  const city = getText(formData, "city");
  const area = getText(formData, "area");
  const bio = getText(formData, "bio");
  const interests = getText(formData, "interests");
  const preferredCategories = getText(formData, "preferred_categories");
  const swapPreferences = getText(formData, "swap_preferences");

  if (displayName.length < 2 || displayName.length > 60) errorRedirect("الاسم لازم يكون بين 2 و60 حرف.");
  if (username.length < 3 || username.length > 30 || !USERNAME_REGEX.test(username)) errorRedirect("اسم المستخدم لازم يكون 3-30 حرف وبحروف صغيرة أو أرقام أو _ أو -.");
  if (profileTagline.length > 120) errorRedirect("الجملة الصغيرة لحد 120 حرف.");
  if (bio.length > 200) errorRedirect("النبذة قصيرة: لحد 200 حرف.");
  if (city.length > 60) errorRedirect("المدينة لحد 60 حرف.");
  if (area.length > 60) errorRedirect("المنطقة لحد 60 حرف.");
  if (interests.length > 180) errorRedirect("الاهتمامات لحد 180 حرف.");
  if (preferredCategories.length > 180) errorRedirect("الفئات المفضلة لحد 180 حرف.");
  if (swapPreferences.length > 240) errorRedirect("تفضيلات المقايضة لحد 240 حرف.");

  const avatarFile = getOptionalFile(formData, "avatar_file");
  const coverFile = getOptionalFile(formData, "cover_file");

  let avatarUrl: string | null | undefined;
  let coverUrl: string | null | undefined;

  if (avatarFile) avatarUrl = await uploadProfileImage(supabase, user.id, avatarFile, "avatar");
  if (coverFile) coverUrl = await uploadProfileImage(supabase, user.id, coverFile, "cover");

  const payload = {
    id: user.id,
    display_name: displayName,
    username,
    profile_tagline: profileTagline || null,
    city: city || null,
    area: area || null,
    bio: bio || null,
    interests: interests || null,
    preferred_categories: preferredCategories || null,
    swap_preferences: swapPreferences || null,
    ...(typeof avatarUrl !== "undefined" ? { avatar_url: avatarUrl } : {}),
    ...(typeof coverUrl !== "undefined" ? { cover_url: coverUrl } : {}),
  };

  const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });

  if (error?.code === "23505") errorRedirect("اسم المستخدم ده مستخدم قبل كده.");
  if (error) errorRedirect("مش قادرين نحفظ بروفايلك دلوقتي. جرّب تاني.");

  redirect("/profile?updated=1");
}
