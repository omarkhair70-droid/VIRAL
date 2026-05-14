import type { ReactNode } from "react";

export function PageHeading({ eyebrow, title, subtitle, actions }: { eyebrow?: string; title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 sm:mb-7">
      <div className="space-y-2">
        {eyebrow ? <p className="type-meta text-app-accent">{eyebrow}</p> : null}
        <h1 className="type-page-title">{title}</h1>
        {subtitle ? <p className="type-support max-w-3xl">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
