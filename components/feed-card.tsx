import Link from "next/link";
import { FeedItem } from "@/lib/demo-feed";

const statusMeta: Record<FeedItem["status"], { label: string; tone: string }> = {
  active: { label: "عروض شغالة", tone: "bg-amber-100 text-amber-900" },
  thinking: { label: "لسه بيفكر", tone: "bg-sky-100 text-sky-900" },
  redirected: { label: "اتفتح باب تاني", tone: "bg-violet-100 text-violet-900" },
  rejected: { label: "العرض ما ظبطش", tone: "bg-stone-200 text-stone-800" },
  completed: { label: "تمت الصفقة", tone: "bg-emerald-100 text-emerald-900" },
  new: { label: "جديد في السوق", tone: "bg-orange-100 text-orange-900" }
};

export function FeedCard({ item }: { item: FeedItem }) {
  const meta = statusMeta[item.status];

  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${meta.tone}`}>{meta.label}</span>
        {item.offeredItem && item.wantedItem ? <span className="text-sm text-gray-500">{item.offeredItem} ↔ {item.wantedItem}</span> : null}
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
      <p className="mt-2 text-sm leading-7 text-gray-600">{item.note}</p>
      <Link href="/feed" className="mt-4 inline-flex text-sm font-medium text-clay hover:underline">شوف العرض</Link>
    </article>
  );
}
