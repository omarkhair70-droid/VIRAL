import type { ReactNode } from "react";
import { AppIcon, type AppIconName } from "@/components/ui/app-icon";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";

type EmptyStateProps = {
  title: string;
  subtitle: string;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  iconName?: AppIconName;
  iconClassName?: string;
};

export function EmptyState({ title, subtitle, action, secondaryAction, iconName, iconClassName }: EmptyStateProps) {
  return (
    <Card className="rounded-surface border border-app-border bg-app-surface text-center shadow-[0_10px_24px_rgba(31,41,55,0.05)]">
      <CardContent className="space-y-3 p-panel-md">
        {iconName ? (
          <div className="flex justify-center text-app-text-muted">
            <span className="rounded-2xl border border-app-border bg-app-soft p-2.5">
              <AppIcon name={iconName} className={["h-7 w-7", iconClassName].filter(Boolean).join(" ")} />
            </span>
          </div>
        ) : null}
        <CardTitle className="type-card-title">{title}</CardTitle>
        <p className="type-support">{subtitle}</p>
      </CardContent>
      {(action || secondaryAction) ? <CardFooter className="justify-center gap-2 p-panel-sm pt-0">{action}{secondaryAction}</CardFooter> : null}
    </Card>
  );
}
