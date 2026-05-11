import type { ReactNode } from "react";

export function PageHeading({ eyebrow, title, subtitle, actions }: { eyebrow?: string; title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="space-y-2">
        {eyebrow ? <p className="text-sm font-medium text-clay">{eyebrow}</p> : null}
        <h1 className="text-2xl font-bold text-ink md:text-3xl">{title}</h1>
        {subtitle ? <p className="max-w-3xl text-sm leading-7 text-muted md:text-base">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
