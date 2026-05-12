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
    <Card className="border-dashed text-center">
      <CardContent>
        {iconName ? (
          <div className="mb-2 flex justify-center text-muted">
            <AppIcon name={iconName} className={["h-8 w-8", iconClassName].filter(Boolean).join(" ")} />
          </div>
        ) : null}
        <CardTitle className="text-lg">{title}</CardTitle>
        <p className="text-sm text-muted">{subtitle}</p>
      </CardContent>
      {(action || secondaryAction) ? <CardFooter className="justify-center">{action}{secondaryAction}</CardFooter> : null}
    </Card>
  );
}
