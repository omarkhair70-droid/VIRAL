import Link from "next/link";
import { StatusPill } from "@/components/ui/status-pill";

type OfferStatus = "pending" | "thinking" | "accepted" | "soft_rejected" | "redirected" | "withdrawn" | "expired" | "cancelled_after_accept";

const map: Record<string, { label: string; tone: "pending" | "warning" | "success" | "muted" }> = {
  pending: { label: "مستنية رد", tone: "pending" },
  thinking: { label: "محتاج تفكير", tone: "warning" },
  accepted: { label: "اتقبلت", tone: "success" },
  soft_rejected: { label: "ما ظبطتش", tone: "muted" },
  redirected: { label: "اتفتح باب تاني", tone: "pending" },
};

export function AccountOfferCard({
  offer,
  sideLabel,
  ctaLabel,
}: {
  offer: { id: string; status: OfferStatus; created_at: string; offeredTitle: string; requestedTitle: string; otherName: string };
  sideLabel: string;
  ctaLabel: string;
}) {
  const meta = map[offer.status] ?? { label: offer.status, tone: "muted" as const };

  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
        <span className="text-xs text-stone-500">{new Date(offer.created_at).toLocaleDateString("ar-EG")}</span>
      </div>
      <p className="text-sm text-stone-600">{sideLabel}: {offer.otherName}</p>
      <p className="mt-2 font-medium">{offer.offeredTitle} مقابل {offer.requestedTitle}</p>
      <Link href={`/offers/${offer.id}`} className="mt-3 inline-flex rounded-lg border px-3 py-1.5 text-sm">{ctaLabel}</Link>
    </article>
  );
}
