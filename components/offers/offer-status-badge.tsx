export function OfferStatusBadge({ status }: { status: string }) {
  if (status === "pending") {
    return <span className="rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-800">لسه مستني رد</span>;
  }

  return <span className="rounded-full bg-stone-100 px-3 py-1 text-sm text-stone-700">{status}</span>;
}
