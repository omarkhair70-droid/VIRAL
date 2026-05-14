import type { HTMLAttributes } from "react";
import { SurfaceCard } from "@/components/ui/surfaces";

function cx(base: string, className?: string) {
  return `${base} ${className ?? ""}`;
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <SurfaceCard className={className} {...props} />;
}
export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("mb-3 space-y-1", className)} {...props} />;
}
export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cx("type-card-title", className)} {...props} />;
}
export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cx("type-body", className)} {...props} />;
}
export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("space-y-3", className)} {...props} />;
}
export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("mt-4 flex flex-wrap gap-actions-gap", className)} {...props} />;
}
