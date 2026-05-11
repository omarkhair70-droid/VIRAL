import { NextResponse } from "next/server";
import { normalizeNextPath } from "@/lib/normalize-next-path";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = normalizeNextPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).maybeSingle();
      const username = profile?.username?.trim();

      if (!username) {
        return NextResponse.redirect(`${origin}/profile/setup?next=${encodeURIComponent(next)}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
