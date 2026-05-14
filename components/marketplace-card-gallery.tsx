"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GalleryIndicator, MediaFrame } from "@/components/ui/product-primitives";

type MarketplaceCardGalleryProps = {
  images: string[];
  title: string;
};

export function MarketplaceCardGallery({ images, title }: MarketplaceCardGalleryProps) {
  const [index, setIndex] = useState(0);
  const total = images.length;

  if (total === 0) {
    return <MediaFrame alt={title} ratio="portrait" fallback={<div className="flex h-full items-center justify-center text-sm text-app-text-muted">لا توجد صورة</div>} />;
  }

  const current = images[index] ?? images[0];

  return (
    <div className="relative">
      <MediaFrame src={current} alt={title} ratio="portrait" />

      {total > 1 ? (
        <>
          <div className="pointer-events-none absolute inset-x-2 top-2 flex justify-end">
            <span className="rounded-full bg-black/45 px-2 py-1 text-xs text-white">{index + 1}/{total}</span>
          </div>

          <div className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-2">
            <Button
              type="button"
              size="compact"
              variant="outline"
              className="border-white/50 bg-black/25 text-white hover:bg-black/40"
              onClick={() => setIndex((prev) => (prev - 1 + total) % total)}
              aria-label="الصورة السابقة"
            >
              السابق
            </Button>

            <div className="rounded-full bg-white/90 px-2 py-1">
              <GalleryIndicator current={index + 1} total={total} />
            </div>

            <Button
              type="button"
              size="compact"
              variant="outline"
              className="border-white/50 bg-black/25 text-white hover:bg-black/40"
              onClick={() => setIndex((prev) => (prev + 1) % total)}
              aria-label="الصورة التالية"
            >
              التالي
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}
