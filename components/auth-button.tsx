"use client";

import Link from "next/link";
import { useTransition } from "react";
import { signOut } from "@/lib/supabase/actions";

export function AuthButton({ loggedIn }: { loggedIn: boolean }) {
  const [pending, start] = useTransition();

  if (!loggedIn) {
    return <Link href="/login" className="rounded-xl bg-clay px-4 py-2 text-white">دخول</Link>;
  }

  return (
    <button
      type="button"
      onClick={() => start(async () => signOut())}
      className="rounded-xl border border-gray-300 px-4 py-2"
      disabled={pending}
    >
      {pending ? "..." : "خروج"}
    </button>
  );
}
