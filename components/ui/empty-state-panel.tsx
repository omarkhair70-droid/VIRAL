import type { ReactNode } from "react";

export function EmptyStatePanel({ title, subtitle, actions }: { title: string; subtitle: string; actions?: ReactNode }) {
  return <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-8 text-center"><p className="text-lg font-semibold text-stone-900">{title}</p><p className="mt-2 text-stone-600">{subtitle}</p>{actions ? <div className="mt-5 flex flex-wrap justify-center gap-3">{actions}</div> : null}</div>;
}
