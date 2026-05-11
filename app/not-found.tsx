import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-bold">الصفحة دي مش موجودة.</h1>
      <p className="text-sm text-stone-600">يمكن الرابط قديم أو الحاجة اتشالت.</p>
      <div className="flex items-center gap-4 text-sm">
        <Link href="/items" className="underline">ارجع للسوق</Link>
        <Link href="/dashboard" className="underline">الداشبورد</Link>
      </div>
    </main>
  );
}
