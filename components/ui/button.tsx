import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentPropsWithoutRef, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "quiet";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary: "bg-clay text-white hover:bg-clayDark",
  secondary: "border border-warmBorder bg-white text-ink hover:bg-sand",
  ghost: "text-ink hover:bg-sand",
  danger: "bg-red-600 text-white hover:bg-red-700",
  quiet: "text-muted hover:text-ink hover:bg-sand",
};

const sizeClasses: Record<Size, string> = {
  sm: "min-h-10 px-3 py-2 text-sm",
  md: "min-h-11 px-4 py-2.5 text-sm",
  lg: "min-h-12 px-5 py-3 text-base",
};

function buttonClassName(variant: Variant, size: Size, className?: string) {
  return `inline-flex items-center justify-center gap-2 rounded-xl font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 ${variantClasses[variant]} ${sizeClasses[size]} ${className ?? ""}`;
}

export function Button({ variant = "primary", size = "md", className, type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button type={type} className={buttonClassName(variant, size, className)} {...props} />;
}

export function ButtonLink({ variant = "primary", size = "md", className, children, ...props }: ComponentPropsWithoutRef<typeof Link> & { variant?: Variant; size?: Size; children: ReactNode }) {
  return (
    <Link className={buttonClassName(variant, size, className)} {...props}>
      {children}
    </Link>
  );
}
