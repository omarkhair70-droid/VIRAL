import type { HTMLAttributes, ReactNode } from "react";

function cx(base: string, className?: string) {
  return `${base} ${className ?? ""}`;
}

export function PageShell({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <section className={cx("mx-auto w-full max-w-5xl px-page-gutter py-8 sm:py-10", className)} {...props} />;
}

export function PageSection({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("space-y-stack-compact", className)} {...props} />;
}

export function HeroPanel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("rounded-hero border border-app-border bg-app-soft p-panel-lg shadow-sm", className)} {...props} />;
}

export function SurfaceCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("rounded-surface border border-app-border bg-app-surface p-panel-md shadow-sm", className)} {...props} />;
}

export function SoftPanel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("rounded-surface-compact border border-app-border/70 bg-app-soft p-panel-md", className)} {...props} />;
}

export function HighlightPanel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("rounded-surface border border-clay/25 bg-app-accent-soft p-panel-md", className)} {...props} />;
}

export function CompactRow({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("rounded-surface-compact border border-app-border bg-app-surface px-panel-md py-row-y", className)} {...props} />;
}

export function InlineNotice({ tone = "neutral", className, children, ...props }: HTMLAttributes<HTMLDivElement> & { tone?: "neutral" | "accent" | "warning" | "danger"; children: ReactNode }) {
  const toneClass = tone === "accent" ? "border-clay/30 bg-app-accent-soft text-app-text-secondary" : tone === "warning" ? "border-amber-300 bg-warningSoft text-amber-900" : tone === "danger" ? "border-red-300 bg-dangerSoft text-red-900" : "border-app-border bg-app-soft text-app-text-secondary";
  return <div className={cx(`rounded-surface-compact border px-panel-md py-row-y text-sm ${toneClass}`, className)} {...props}>{children}</div>;
}

export function SectionBreak({ className, ...props }: HTMLAttributes<HTMLHRElement>) {
  return <hr className={cx("border-0 border-t border-app-border/80", className)} {...props} />;
}
