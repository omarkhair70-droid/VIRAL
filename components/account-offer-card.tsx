import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { OfferStatusBadge } from "@/components/offers/offer-status-badge";
import type { Route } from "next";

type OfferStatus = "pending" | "thinking" | "accepted" | "soft_rejected" | "redirected" | "withdrawn" | "expired" | "cancelled_after_accept";

export function AccountOfferCard({
  offer,
  sideLabel,
  ctaLabel,
}: {
  offer: { id: string; status: OfferStatus; created_at: string; offeredTitle: string; requestedTitle: string; otherName: string };
  sideLabel: string;
  ctaLabel: string;
}) {
  return (
    <Card className="p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <OfferStatusBadge status={offer.status} />
        <span className="text-xs text-stone-500">{new Date(offer.created_at).toLocaleDateString("ar-EG")}</span>
      </div>
      <p className="text-sm text-stone-600">{sideLabel}: {offer.otherName}</p>
      <p className="mt-2 font-medium">{offer.offeredTitle} مقابل {offer.requestedTitle}</p>
      <ButtonLink href={`/offers/${offer.id}` as Route} variant="secondary" size="sm" className="mt-3">{ctaLabel}</ButtonLink>
    </Card>
  );
}
