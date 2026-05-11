"use client";

import { useEffect, useMemo, useState } from "react";

type ShareActionsProps = {
  urlPath: string;
  title: string;
  text?: string;
  label?: string;
};

export function ShareActions({ urlPath, title, text, label }: ShareActionsProps) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  const absoluteUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    try {
      return new URL(urlPath, window.location.origin).toString();
    } catch {
      return `${window.location.origin}${urlPath.startsWith("/") ? urlPath : `/${urlPath}`}`;
    }
  }, [urlPath]);

  const onShare = async () => {
    if (!absoluteUrl || typeof navigator === "undefined" || !navigator.share) return;
    try {
      await navigator.share({ title, text, url: absoluteUrl });
    } catch {
      // User cancelled or browser blocked; intentionally silent.
    }
  };

  const onCopy = async () => {
    if (!absoluteUrl || typeof navigator === "undefined" || !navigator.clipboard) {
      setCopyError(true);
      return;
    }

    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setCopied(true);
      setCopyError(false);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopyError(true);
    }
  };

  return (
    <div className="space-y-2" dir="rtl">
      {label ? <p className="text-sm font-medium text-stone-700">{label}</p> : null}
      <div className="flex flex-wrap items-center gap-2">
        {canShare ? (
          <button
            type="button"
            onClick={onShare}
            className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50"
            aria-label="شارك الإعلان"
          >
            شارك
          </button>
        ) : null}
        <button
          type="button"
          onClick={onCopy}
          className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50"
          aria-label="انسخ لينك الصفحة"
        >
          انسخ اللينك
        </button>
        {copied ? <span className="text-xs text-emerald-700">اتنسخ</span> : null}
      </div>
      {copyError ? <p className="text-xs text-amber-700">انسخ اللينك من شريط العنوان</p> : null}
    </div>
  );
}
