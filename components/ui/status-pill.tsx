import type { ReactNode } from "react";

type Tone = "pending" | "success" | "muted" | "warning";
const toneClasses: Record<Tone, string> = { pending: "bg-amber-100 text-amber-900 border-amber-200", success: "bg-emerald-100 text-emerald-900 border-emerald-200", muted: "bg-stone-100 text-stone-700 border-stone-200", warning: "bg-orange-100 text-orange-900 border-orange-200" };

export function StatusPill({ children, tone = "muted" }: { children: ReactNode; tone?: Tone }) {
  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${toneClasses[tone]}`}>{children}</span>;
}
