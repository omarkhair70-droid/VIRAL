import type { Route } from "next";
import { OfferStatusBadge } from "@/components/offers/offer-status-badge";
import { ButtonLink } from "@/components/ui/button";
import { SoftPanel, SurfaceCard } from "@/components/ui/surfaces";

type OfferStatus = "pending" | "thinking" | "accepted" | "soft_rejected" | "redirected" | "withdrawn" | "expired" | "cancelled_after_accept";

export function AccountOfferCard({ offer, sideLabel, ctaLabel }: { offer: { id: string; status: OfferStatus; created_at: string; offeredTitle: string; requestedTitle: string; otherName: string; parent_offer_id?: string | null }; sideLabel: string; ctaLabel: string; }) {
  return <SurfaceCard className="space-y-3 p-4">
    <div className="flex items-center justify-between gap-2"><OfferStatusBadge status={offer.status} /><span className="text-xs text-app-text-muted">{new Date(offer.created_at).toLocaleDateString("ar-EG")}</span></div>
    <p className="text-sm text-app-text-secondary">{sideLabel}: <span className="font-medium text-app-text-primary">{offer.otherName}</span></p>
    <SoftPanel className="p-3"><p className="text-sm font-medium">{offer.offeredTitle} ↔ {offer.requestedTitle}</p>{offer.parent_offer_id ? <p className="mt-1 text-xs text-sky-700">عرض متابعة بعد فتح باب تاني</p> : null}</SoftPanel>
    <ButtonLink href={`/offers/${offer.id}` as Route} variant="secondary" size="sm">{ctaLabel}</ButtonLink>
  </SurfaceCard>;
}
