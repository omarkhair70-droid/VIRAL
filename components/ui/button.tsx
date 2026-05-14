import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentPropsWithoutRef, ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline" | "quiet" | "destructive";
type Size = "compact" | "sm" | "md" | "lg";

type Shared = {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  iconOnly?: boolean;
};

const variantClasses: Record<Variant, string> = {
  primary: "bg-app-accent text-white hover:bg-app-accent-hover active:bg-app-accent-hover",
  secondary: "bg-app-soft text-app-text-secondary hover:bg-[#f7eee4]",
  outline: "border border-app-border bg-app-surface text-app-text-primary hover:bg-app-soft",
  quiet: "bg-transparent text-app-text-muted hover:bg-app-soft hover:text-app-text-primary",
  destructive: "bg-red-600 text-white hover:bg-red-700 active:bg-red-700",
};

const sizeClasses: Record<Size, string> = {
  compact: "min-h-9 rounded-button px-3 py-1.5 text-sm",
  sm: "min-h-10 rounded-button px-3 py-2 text-sm",
  md: "min-h-11 rounded-button px-4 py-2.5 text-sm",
  lg: "min-h-12 rounded-button px-5 py-3 text-base",
};

function buttonClassName({ variant = "primary", size = "md", fullWidth, iconOnly, className }: Shared & { className?: string }) {
  return `inline-flex items-center justify-center gap-2 font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-focus focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? "w-full" : ""} ${iconOnly ? "aspect-square px-0" : ""} ${className ?? ""}`;
}

export function Button({ variant = "primary", size = "md", className, type = "button", loading, children, disabled, fullWidth, iconOnly, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & Shared) {
  return <button type={type} className={buttonClassName({ variant, size, className, fullWidth, iconOnly })} aria-busy={loading || undefined} disabled={disabled || loading} {...props}>{loading ? "..." : children}</button>;
}

export function ButtonLink({ variant = "primary", size = "md", className, children, fullWidth, iconOnly, ...props }: ComponentPropsWithoutRef<typeof Link> & Shared & { children: ReactNode }) {
  return (
    <Link className={buttonClassName({ variant, size, className, fullWidth, iconOnly })} {...props}>
      {children}
    </Link>
  );
}
