import { AppIcon } from "@/components/ui/app-icon";
import type { TrustBadge } from "@/lib/trust-badges";

export function TrustBadges({ badges, compact = false, maxVisible }: { badges: TrustBadge[]; compact?: boolean; maxVisible?: number }) {
  const visible = typeof maxVisible === "number" ? badges.slice(0, maxVisible) : badges;
  if (!visible.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {visible.map((badge) => (
        <span key={badge.key} className={["inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs", badge.tone === "trait" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-stone-200 bg-stone-50 text-stone-800", compact ? "px-2.5 py-1" : ""].join(" ")}>
          <AppIcon name={badge.icon} className="size-3.5" />
          <span>{badge.label}</span>
          {badge.count ? <span className="text-[11px] text-stone-500">· {badge.count}</span> : null}
        </span>
      ))}
    </div>
  );
}
