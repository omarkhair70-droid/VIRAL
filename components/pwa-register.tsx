"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch((error: unknown) => {
      if (process.env.NODE_ENV === "development") {
        console.warn("Service worker registration failed", error);
      }
    });
  }, []);

  return null;
}
