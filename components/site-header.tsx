import Link from "next/link";
import { AuthButton } from "@/components/auth-button";
import { createClient } from "@/lib/supabase/server";

export async function SiteHeader() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  return <header className="sticky top-0 z-20 border-b border-gray-200 bg-sand/95 backdrop-blur"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4"><Link href="/" className="flex flex-col"><span className="text-xl font-bold">بدّلها</span><span className="hidden text-xs text-stone-500 md:block">كل حاجة عندها صاحب تاني</span></Link><nav className="flex max-w-full items-center gap-2 overflow-x-auto text-sm"><Link className="whitespace-nowrap" href="/feed">العروض</Link><Link className="whitespace-nowrap" href="/items">السوق</Link><Link className="whitespace-nowrap" href="/items/new">اعرض حاجة</Link><Link className="whitespace-nowrap" href="/how-it-works">إزاي بتشتغل</Link><Link className="whitespace-nowrap" href="/safety">الأمان</Link><AuthButton loggedIn={Boolean(data.user)} /></nav></div></header>;
}
