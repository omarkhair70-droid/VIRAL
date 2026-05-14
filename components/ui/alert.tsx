import type { HTMLAttributes } from "react";

type Variant = "info" | "success" | "warning" | "danger";
const variants: Record<Variant, string> = {
  info: "border-app-border bg-app-soft text-app-text-secondary",
  success: "border-emerald-200 bg-successSoft text-emerald-900",
  warning: "border-amber-200 bg-warningSoft text-amber-900",
  danger: "border-red-200 bg-dangerSoft text-red-900",
};

export function Alert({ variant = "info", className, ...props }: HTMLAttributes<HTMLDivElement> & { variant?: Variant }) {
  return <div className={`rounded-surface-compact border p-panel-sm type-support ${variants[variant]} ${className ?? ""}`} role="status" {...props} />;
}
