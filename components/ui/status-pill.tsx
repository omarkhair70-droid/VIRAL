import type { ReactNode } from "react";
import { StatusBadge } from "@/components/ui/status-badge";

type Tone = "pending" | "success" | "muted" | "warning";
const toneMap: Record<Tone, "active" | "success" | "muted" | "warning"> = {
  pending: "active",
  success: "success",
  muted: "muted",
  warning: "warning",
};

export function StatusPill({ children, tone = "muted" }: { children: ReactNode; tone?: Tone }) {
  return <StatusBadge variant={toneMap[tone]}>{children}</StatusBadge>;
}
