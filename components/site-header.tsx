import Link from "next/link";
import { AuthButton } from "@/components/auth-button";
import { createClient } from "@/lib/supabase/server";

export async function SiteHeader() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-sand/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-bold text-xl">Swap</Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/feed">الصفقات الغريبة</Link>
          <Link href="/items">السوق</Link>
          <Link href="/items/new">اعرض حاجة</Link>
          <Link href="/how-it-works">ازاي بتشتغل</Link>
          <Link href="/safety">الأمان</Link>
          <AuthButton loggedIn={Boolean(data.user)} />
        </nav>
      </div>
    </header>
  );
}
