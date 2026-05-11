import type { ReactNode } from "react";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";

export function EmptyState({ title, subtitle, action, secondaryAction }: { title: string; subtitle: string; action?: ReactNode; secondaryAction?: ReactNode }) {
  return (
    <Card className="border-dashed text-center">
      <CardContent>
        <CardTitle className="text-lg">{title}</CardTitle>
        <p className="text-sm text-muted">{subtitle}</p>
      </CardContent>
      {(action || secondaryAction) ? <CardFooter className="justify-center">{action}{secondaryAction}</CardFooter> : null}
    </Card>
  );
}
