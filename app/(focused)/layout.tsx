import type { ReactNode } from "react";
import { FocusedFlowShell } from "@/components/focused-flow-shell";

export default function FocusedLayout({ children }: { children: ReactNode }) {
  return <FocusedFlowShell>{children}</FocusedFlowShell>;
}
