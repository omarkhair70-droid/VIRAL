"use client";

import { useMemo, useState } from "react";
import { AppIcon } from "@/components/ui/app-icon";
import { GalleryIndicator, MediaFrame } from "@/components/ui/product-primitives";

type GalleryImage = { image_url: string; is_primary: boolean | null };

export function ItemDetailGallery({ images, title }: { images: GalleryImage[]; title: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const hasImages = images.length > 0;
  const active = hasImages ? images[activeIndex] : null;
  const currentLabel = useMemo(() => `${activeIndex + 1} / ${images.length}`, [activeIndex, images.length]);

  const goNext = () => setActiveIndex((prev) => (prev + 1) % images.length);
  const goPrev = () => setActiveIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-surface border border-app-border bg-app-surface p-2 sm:p-3">
        <MediaFrame src={active?.image_url ?? null} alt={title} ratio="wide" fallback={<div className="flex h-full items-center justify-center text-sm text-app-text-muted">لا توجد صور للحاجة دي</div>} />
        {images.length > 1 ? (
          <>
            <div className="pointer-events-none absolute inset-x-0 bottom-4 flex items-center justify-center">
              <span className="rounded-full bg-black/55 px-2 py-1 text-xs text-white">{currentLabel}</span>
            </div>
            <button type="button" onClick={goPrev} className="absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-black/40 text-white transition hover:bg-black/55" aria-label="الصورة السابقة">
              <AppIcon name="forward" className="h-4 w-4" />
            </button>
            <button type="button" onClick={goNext} className="absolute left-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-black/40 text-white transition hover:bg-black/55" aria-label="الصورة التالية">
              <AppIcon name="back" className="h-4 w-4" />
            </button>
          </>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <GalleryIndicator current={activeIndex + 1} total={images.length} />
            <p className="text-xs text-app-text-muted">اختار صورة للتفاصيل</p>
          </div>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {images.map((image, index) => (
              <button
                type="button"
                key={`${image.image_url}-${index}`}
                onClick={() => setActiveIndex(index)}
                className={`overflow-hidden rounded-surface-compact border p-0.5 transition ${index === activeIndex ? "border-clay ring-1 ring-clay/30" : "border-app-border hover:border-clay/40"}`}
                aria-label={`عرض الصورة ${index + 1}`}
                aria-current={index === activeIndex}
              >
                <MediaFrame src={image.image_url} alt={`${title} - صورة ${index + 1}`} ratio="square" />
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
