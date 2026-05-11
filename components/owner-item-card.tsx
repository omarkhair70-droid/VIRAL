import Link from "next/link";
import { archiveItem, reactivateItem } from "@/app/dashboard/items/actions";
import { ImageFrame } from "@/components/ui/image-frame";
import { StatusPill } from "@/components/ui/status-pill";

type ItemStatus = "active" | "archived" | "reserved" | "swapped" | "removed";

type OwnerItemCardProps = {
  item: {
    id: string;
    title: string;
    status: ItemStatus;
    created_at: string;
    categoryName: string | null;
    imageUrl: string | null;
  };
};

const statusMap: Record<ItemStatus, string> = {
  active: "نشط",
  archived: "مؤرشف",
  reserved: "محجوز",
  swapped: "تم تبديله",
  removed: "محذوف",
};

export function OwnerItemCard({ item }: OwnerItemCardProps) {
  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <ImageFrame imageUrl={item.imageUrl} title={item.title} />
      <div className="mt-3 space-y-2">
        <div className="flex flex-wrap gap-2">
          <StatusPill>{item.categoryName ?? "بدون تصنيف"}</StatusPill>
          <StatusPill tone={item.status === "active" ? "success" : "muted"}>{statusMap[item.status]}</StatusPill>
        </div>
        <h3 className="text-lg font-semibold">{item.title}</h3>
        <p className="text-xs text-stone-500">اتنشر يوم {new Date(item.created_at).toLocaleDateString("ar-EG")}</p>
        <div className="flex flex-wrap gap-2 pt-2">
          <Link href={`/items/${item.id}`} className="rounded-lg border px-3 py-1.5 text-sm">افتح الإعلان</Link>
          <Link href={`/items/${item.id}/edit`} className="rounded-lg border px-3 py-1.5 text-sm">عدّل الإعلان</Link>
          {item.status === "active" ? (
            <form action={archiveItem}>
              <input type="hidden" name="item_id" value={item.id} />
              <button type="submit" className="rounded-lg border px-3 py-1.5 text-sm">أرشف الإعلان</button>
            </form>
          ) : null}
          {item.status === "archived" ? (
            <form action={reactivateItem}>
              <input type="hidden" name="item_id" value={item.id} />
              <button type="submit" className="rounded-lg border px-3 py-1.5 text-sm">فعّل الإعلان من جديد</button>
            </form>
          ) : null}
        </div>
      </div>
    </article>
  );
}
