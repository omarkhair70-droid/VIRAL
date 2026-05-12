"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AppIcon } from "@/components/ui/app-icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const DISMISS_KEY = "pwa-install-card-dismissed-at";
const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

function isStandaloneMode() {
  if (typeof window === "undefined") return false;
  const iosStandalone = "standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  return window.matchMedia("(display-mode: standalone)").matches || iosStandalone;
}

export function PwaInstallCard() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(false);

  const dismissedRecently = useMemo(() => {
    if (typeof window === "undefined") return false;
    const raw = window.localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const dismissedAt = Number(raw);
    if (!Number.isFinite(dismissedAt)) return false;
    return Date.now() - dismissedAt < DISMISS_COOLDOWN_MS;
  }, []);

  useEffect(() => {
    if (dismissedRecently || isStandaloneMode()) {
      setHidden(true);
      return;
    }

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setDeferredPrompt(null);
      setHidden(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, [dismissedRecently]);

  const dismissCard = useCallback(() => {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setHidden(true);
  }, []);

  const installApp = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setHidden(true);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  if (!deferredPrompt || hidden || dismissedRecently) return null;

  return (
    <Card className="rounded-3xl border-clay/20 bg-cream/80 p-0">
      <CardContent className="flex items-start justify-between gap-3 p-4">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 rounded-xl bg-clay/10 p-2 text-clay">
            <AppIcon name="spark" className="h-4 w-4" />
          </span>
          <div>
            <p className="font-semibold text-ink">ثبّت بدّلها على موبايلك</p>
            <p className="mt-1 text-sm text-muted">افتحه أسرع وخليه أقرب لتطبيق حقيقي.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" onClick={installApp}>ثبّت التطبيق</Button>
              <Button size="sm" variant="quiet" onClick={dismissCard}>بعدين</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
