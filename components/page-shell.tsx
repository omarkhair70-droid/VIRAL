import { ReactNode } from "react";

export function PageShell({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold">{title}</h1>
      {subtitle ? <p className="mt-3 text-gray-600">{subtitle}</p> : null}
      <div className="mt-8">{children}</div>
    </section>
  );
}
