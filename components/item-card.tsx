import Link from "next/link";
import type { Route } from "next";
import { MarketplaceCardGallery } from "@/components/marketplace-card-gallery";
import { ButtonLink } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { SurfaceCard } from "@/components/ui/surfaces";

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
  };
};

const conditionLabels = {
  almost_new: "جديد تقريبًا",
  good_used: "مستخدم بحالة كويسة",
  minor_issues: "فيه عيوب بسيطة",
  needs_repair: "محتاج تصليح / عارف حالته",
};

const desireLabels = {
  specific: "بدور على حاجة معينة",
  flexible: "عندي بدائل مرنة",
  surprise: "مفتوح للمفاجآت",
};

export function ItemCard({ item }: ItemCardProps) {
  const imageUrls = item.imageUrls?.length ? item.imageUrls : item.imageUrl ? [item.imageUrl] : [];

  return (
    <SurfaceCard className="overflow-hidden p-2">
      <Link href={`/items/${item.id}` as Route} className="block" aria-label={`افتح إعلان ${item.title}`}>
        <MarketplaceCardGallery images={imageUrls} title={item.title} />
      </Link>

      <div className="space-y-3 px-1 pb-1 pt-3">
        <div className="flex flex-wrap gap-2">
          {item.categoryName ? <StatusPill>{item.categoryName}</StatusPill> : null}
          <StatusPill tone="warning">{conditionLabels[item.condition]}</StatusPill>
          {item.hasStory ? <StatusPill tone="pending">ليها حكاية</StatusPill> : null}
        </div>

        <h3 className="line-clamp-2 text-lg font-semibold text-app-text-primary">{item.title}</h3>

        {item.city || item.area ? (
          <p className="text-xs text-app-text-muted">{[item.city, item.area].filter(Boolean).join(" - ")}</p>
        ) : null}

        <div className="space-y-1.5">
          <p className="text-sm font-medium text-app-text-secondary">{desireLabels[item.desire_mode]}</p>
          {item.desire_text ? <p className="line-clamp-2 text-sm text-app-text-muted">{item.desire_text}</p> : null}
        </div>

        <ButtonLink href={`/items/${item.id}` as Route} size="sm" variant="outline">
          افتح الإعلان
        </ButtonLink>
      </div>
    </SurfaceCard>
  );
}
