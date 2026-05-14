import type { ReactNode } from "react";

export function FocusedFlowShell({ children }: { children: ReactNode }) {
  return <main className="min-h-dvh bg-app-canvas">{children}</main>;
}
