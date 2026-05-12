"use client";

import { Button } from "@/components/ui/button";

export function OfflineRetryButton() {
  return <Button variant="secondary" onClick={() => window.location.reload()}>جرّب تاني</Button>;
}
