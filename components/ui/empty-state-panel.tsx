import type { ReactNode } from "react";
import { EmptyState } from "@/components/ui/empty-state";

export function EmptyStatePanel({ title, subtitle, actions }: { title: string; subtitle: string; actions?: ReactNode }) {
  return <EmptyState title={title} subtitle={subtitle} action={actions} />;
}
