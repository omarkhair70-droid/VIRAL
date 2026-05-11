export function OfferStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: "لسه مستني رد", cls: "bg-amber-100 text-amber-800" },
    thinking: { label: "صاحب الحاجة محتاج يفكر", cls: "bg-yellow-100 text-yellow-800" },
    accepted: { label: "العرض اتقبل", cls: "bg-emerald-100 text-emerald-800" },
    soft_rejected: { label: "العرض ما ظبطش", cls: "bg-stone-200 text-stone-700" },
    redirected: { label: "اتفتح باب تاني", cls: "bg-sky-100 text-sky-800" },
    withdrawn: { label: "العرض اتسحب", cls: "bg-stone-100 text-stone-700" },
    expired: { label: "العرض انتهى", cls: "bg-stone-100 text-stone-700" },
    cancelled_after_accept: { label: "اتلغى بعد القبول", cls: "bg-stone-100 text-stone-700" },
  };
  const meta = map[status] ?? { label: status, cls: "bg-stone-100 text-stone-700" };
  return <span className={`rounded-full px-3 py-1 text-sm ${meta.cls}`}>{meta.label}</span>;
}
