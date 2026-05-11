import { StatusBadge } from "@/components/ui/status-badge";

export function OfferStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: "warning" | "success" | "active" | "muted" }> = {
    pending: { label: "لسه مستني رد", variant: "warning" },
    thinking: { label: "صاحب الحاجة محتاج يفكر", variant: "active" },
    accepted: { label: "العرض اتقبل", variant: "success" },
    soft_rejected: { label: "العرض ما ظبطش", variant: "muted" },
    redirected: { label: "اتفتح باب تاني", variant: "active" },
    withdrawn: { label: "العرض اتسحب", variant: "muted" },
    expired: { label: "العرض انتهى", variant: "muted" },
    cancelled_after_accept: { label: "اتلغى بعد القبول", variant: "muted" },
  };
  const meta = map[status] ?? { label: status, variant: "muted" as const };
  return <StatusBadge variant={meta.variant}>{meta.label}</StatusBadge>;
}
