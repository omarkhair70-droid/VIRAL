import { ReactNode } from "react";
import { PageSection, PageShell as Shell } from "@/components/ui/surfaces";

export function PageShell({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <Shell>
      <PageSection className="space-y-stack-section">
        <div>
          <h1 className="type-page-title">{title}</h1>
          {subtitle ? <p className="mt-3 type-support">{subtitle}</p> : null}
        </div>
        <div>{children}</div>
      </PageSection>
    </Shell>
  );
}
