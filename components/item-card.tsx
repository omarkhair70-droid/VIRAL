import Link from "next/link";

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
  flexible: "عندي حاجات في بالي، بس فاجئني",
  surprise: "فاجئني تمامًا",
};

export function ItemCard({ item }: ItemCardProps) {
  return (
    <Link href={`/items/${item.id}`} className="block overflow-hidden rounded-2xl border border-stone-200 bg-white transition hover:shadow-md">
      <div className="aspect-video bg-stone-100">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-stone-500">مفيش صورة دلوقتي</div>
        )}
      </div>
      <div className="space-y-2 p-4">
        <h3 className="text-lg font-semibold text-stone-900">{item.title}</h3>
        {item.categoryName ? <p className="text-sm text-stone-500">{item.categoryName}</p> : null}
        <p className="text-sm text-stone-700">{conditionLabels[item.condition]}</p>
        <p className="text-sm text-stone-600">{desireLabels[item.desire_mode]}</p>
        {item.desire_text ? <p className="line-clamp-2 text-sm text-stone-500">{item.desire_text}</p> : null}
        {item.city || item.area ? <p className="text-xs text-stone-500">{[item.city, item.area].filter(Boolean).join(" - ")}</p> : null}
      </div>
    </Link>
  );
}
