import Link from "next/link";
import { ImageFrame } from "@/components/ui/image-frame";
import { StatusPill } from "@/components/ui/status-pill";

type ItemCardProps = { item: { id: string; title: string; condition: "almost_new" | "good_used" | "minor_issues" | "needs_repair"; city: string | null; area: string | null; desire_mode: "specific" | "flexible" | "surprise"; desire_text: string | null; categoryName: string | null; imageUrl: string | null; }; };
const conditionLabels = { almost_new: "جديد تقريبًا", good_used: "مستخدم بحالة كويسة", minor_issues: "فيه عيوب بسيطة", needs_repair: "محتاج تصليح / عارف حالته" };
const desireLabels = { specific: "بدور على حاجة معينة", flexible: "عندي بدائل مرنة", surprise: "مفتوح للمفاجآت" };

export function ItemCard({ item }: ItemCardProps) {
  return <article className="overflow-hidden rounded-2xl border border-stone-200 bg-white p-3 shadow-sm"><ImageFrame imageUrl={item.imageUrl} title={item.title} /><div className="space-y-2 p-1 pt-3"><div className="flex flex-wrap gap-2">{item.categoryName ? <StatusPill>{item.categoryName}</StatusPill> : null}<StatusPill tone="warning">{conditionLabels[item.condition]}</StatusPill></div><h3 className="text-lg font-semibold text-stone-900">{item.title}</h3>{item.city || item.area ? <p className="text-xs text-stone-500">{[item.city, item.area].filter(Boolean).join(" - ")}</p> : null}<p className="text-sm text-stone-600">{desireLabels[item.desire_mode]}</p>{item.desire_text ? <p className="line-clamp-2 text-sm text-stone-500">{item.desire_text}</p> : null}<Link href={`/items/${item.id}`} className="inline-flex rounded-lg border border-stone-300 px-3 py-2 text-sm">افتح الإعلان</Link></div></article>;
}
