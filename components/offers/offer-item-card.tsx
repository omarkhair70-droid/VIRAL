import Link from "next/link";
import { MediaFrame } from "@/components/ui/product-primitives";
import { SurfaceCard } from "@/components/ui/surfaces";

type Props = {
  itemId: string;
  title: string;
  imageUrl: string | null;
  category: string | null;
  conditionLabel: string;
  ownerName?: string | null;
};

export function OfferItemCard({ itemId, title, imageUrl, category, conditionLabel, ownerName }: Props) {
  return (
    <SurfaceCard className="space-y-3 p-3 md:p-4">
      <MediaFrame src={imageUrl} alt={title} ratio="wide" fallback={<div className="flex h-full items-center justify-center text-sm text-app-text-muted">لا توجد صورة للحاجة</div>} />
      <div className="space-y-1.5">
        <Link href={`/items/${itemId}`} className="line-clamp-2 font-semibold text-app-text hover:underline">{title}</Link>
        <p className="text-sm text-app-text-muted">{category ?? "بدون تصنيف"}</p>
        <p className="text-sm text-app-text-muted">الحالة: {conditionLabel}</p>
        {ownerName ? <p className="text-xs text-app-text-muted">صاحبها: {ownerName}</p> : null}
      </div>
      <Link href={`/items/${itemId}`} className="inline-flex min-h-10 rounded-button bg-transparent px-3 py-2 text-sm text-app-text-muted hover:bg-app-soft">افتح الحاجة</Link>
    </SurfaceCard>
  );
}
