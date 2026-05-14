import type { Route } from "next";
import { MarketplaceCardGallery } from "@/components/marketplace-card-gallery";
import { ButtonLink } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { SurfaceCard } from "@/components/ui/surfaces";
import { getTeswaConditionLabel, getTeswaDesireModeLabel } from "@/lib/teswa-product-language";

type ItemCardProps = {
  item: {
    id: string;
    title: string;
    condition: "almost_new" | "good_used" | "minor_issues" | "needs_repair";
    city: string | null;
    area: string | null;
    desire_mode: "specific" | "flexible" | "surprise";
    desire_text: string | null;
    categoryName: string | null;
    imageUrl: string | null;
    imageUrls?: string[];
    hasStory?: boolean;
    item_story?: string | null;
    swap_reason?: string | null;
    good_for?: string | null;
  };
};

function buildHookLine(item: ItemCardProps["item"]) {
  const firstMeaningful = [item.desire_text, item.swap_reason, item.good_for, item.item_story]
    .map((value) => value?.trim())
    .find((value) => Boolean(value));

  if (firstMeaningful) return firstMeaningful;

  if (item.desire_mode === "surprise") return "صاحبها فاتح باب مفاجآت.";
  if (item.desire_mode === "flexible") return "صاحبها عنده اتجاه… لكن الباب لسه مفتوح.";

  return "صاحبها عارف تقريبًا مستني إيه.";
}

export function ItemCard({ item }: ItemCardProps) {
  const imageUrls = item.imageUrls?.length ? item.imageUrls : item.imageUrl ? [item.imageUrl] : [];
  const itemHref = `/items/${item.id}` as Route;

  return (
    <SurfaceCard className="overflow-hidden p-2">
      <MarketplaceCardGallery images={imageUrls} title={item.title} href={itemHref} />

      <div className="space-y-3 px-1 pb-1 pt-3">
        <div className="flex flex-wrap gap-2">
          {item.categoryName ? <StatusPill>{item.categoryName}</StatusPill> : null}
          <StatusPill tone="pending">{getTeswaDesireModeLabel(item.desire_mode)}</StatusPill>
          {item.hasStory ? <StatusPill tone="pending">ليها حكاية</StatusPill> : null}
        </div>

        <h3 className="line-clamp-2 text-lg font-semibold text-app-text-primary">{item.title}</h3>

        <p className="line-clamp-2 text-sm leading-6 text-app-text-secondary">{buildHookLine(item)}</p>
        {item.city || item.area ? (
          <p className="text-xs text-app-text-muted">{[item.city, item.area].filter(Boolean).join(" - ")}</p>
        ) : null}

        <p className="text-xs text-app-text-muted">اللي لازم يتعرف: {getTeswaConditionLabel(item.condition)}</p>

        <ButtonLink href={itemHref} size="sm" variant="outline">
          افتح الاحتمال
        </ButtonLink>
      </div>
    </SurfaceCard>
  );
}
