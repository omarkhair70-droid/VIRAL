import Link from "next/link";
import { StatusPill } from "@/components/ui/status-pill";

export type RealOfferCardData = { id: string; status: string; createdAt: string; senderName: string; receiverName: string; offeredTitle: string; requestedTitle: string; offeredImage: string | null; requestedImage: string | null; };

export function OfferCard({ offer }: { offer: RealOfferCardData }) {
  return <article className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"><div className="mb-3 flex items-center justify-between"><StatusPill tone={offer.status === "pending" ? "pending" : "muted"}>{offer.status === "pending" ? "لسه مستنية رد" : offer.status}</StatusPill><span className="text-xs text-stone-500">{new Date(offer.createdAt).toLocaleDateString("ar-EG")}</span></div><p className="text-sm text-stone-600">{offer.senderName} ↔ {offer.receiverName}</p><h3 className="mt-2 font-semibold text-stone-900">{offer.offeredTitle} مقابل {offer.requestedTitle}</h3><Link href={`/offers/${offer.id}`} className="mt-4 inline-flex text-sm font-medium text-clay hover:underline">افتح عرض المقايضة</Link></article>;
}
