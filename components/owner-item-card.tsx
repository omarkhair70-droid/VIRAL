import type { Route } from "next";
import { archiveItem, reactivateItem } from "@/app/dashboard/items/actions";
import { Button, ButtonLink } from "@/components/ui/button";
import { MediaFrame } from "@/components/ui/product-primitives";
import { StatusPill } from "@/components/ui/status-pill";
import { SurfaceCard } from "@/components/ui/surfaces";

type ItemStatus = "active" | "archived" | "reserved" | "swapped" | "removed";
const statusMap: Record<ItemStatus, string> = { active: "نشط", archived: "مؤرشف", reserved: "محجوز", swapped: "تم تبديله", removed: "محذوف" };

export function OwnerItemCard({ item }: { item: { id: string; title: string; status: ItemStatus; created_at: string; categoryName: string | null; imageUrl: string | null; }; }) {
  return <SurfaceCard className="space-y-3 p-3"><MediaFrame src={item.imageUrl} alt={item.title} ratio="wide" />
    <div className="flex flex-wrap gap-2"><StatusPill>{item.categoryName ?? "بدون تصنيف"}</StatusPill><StatusPill tone={item.status === "active" ? "success" : "muted"}>{statusMap[item.status]}</StatusPill></div>
    <h3 className="text-base font-semibold">{item.title}</h3>
    <p className="text-xs text-app-text-muted">اتنشر يوم {new Date(item.created_at).toLocaleDateString("ar-EG")}</p>
    <div className="flex flex-wrap gap-2"><ButtonLink href={`/items/${item.id}` as Route} variant="outline" size="sm">افتح الإعلان</ButtonLink><ButtonLink href={`/items/${item.id}/edit` as Route} variant="outline" size="sm">عدّل الإعلان</ButtonLink>
      {item.status === "active" ? <form action={archiveItem}><input type="hidden" name="item_id" value={item.id} /><Button type="submit" variant="secondary" size="sm">أرشف الإعلان</Button></form> : null}
      {item.status === "archived" ? <form action={reactivateItem}><input type="hidden" name="item_id" value={item.id} /><Button type="submit" variant="secondary" size="sm">فعّل الإعلان من جديد</Button></form> : null}
    </div>
  </SurfaceCard>;
}
