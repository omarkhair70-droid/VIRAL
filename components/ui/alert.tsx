import type { HTMLAttributes } from "react";

type Variant = "info" | "success" | "warning" | "danger";
const variants: Record<Variant, string> = {
  info: "border-warmBorder bg-sand text-ink",
  success: "border-emerald-200 bg-successSoft text-emerald-900",
  warning: "border-amber-200 bg-warningSoft text-amber-900",
  danger: "border-red-200 bg-dangerSoft text-red-900",
};

export function Alert({ variant = "info", className, ...props }: HTMLAttributes<HTMLDivElement> & { variant?: Variant }) {
  return <div className={`rounded-xl border p-3 text-sm leading-7 ${variants[variant]} ${className ?? ""}`} {...props} />;
}
