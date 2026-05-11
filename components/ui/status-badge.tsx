import type { ReactNode } from "react";

type Variant = "neutral" | "active" | "success" | "warning" | "danger" | "muted";
const styles: Record<Variant, string> = {
  neutral: "border-warmBorder bg-sand text-ink",
  active: "border-clay/20 bg-clay/10 text-clayDark",
  success: "border-emerald-200 bg-successSoft text-emerald-900",
  warning: "border-amber-200 bg-warningSoft text-amber-900",
  danger: "border-red-200 bg-dangerSoft text-red-900",
  muted: "border-stone-200 bg-stone-100 text-stone-700",
};

export function StatusBadge({ children, variant = "neutral" }: { children: ReactNode; variant?: Variant }) {
  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${styles[variant]}`}>{children}</span>;
}
