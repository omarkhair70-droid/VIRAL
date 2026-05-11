import Link from "next/link";

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
    <div className="rounded-2xl border border-stone-200 bg-white p-4">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={title} className="mb-3 aspect-video w-full rounded-xl object-cover" />
      ) : null}
      <p className="font-semibold">{title}</p>
      <p className="text-sm text-stone-600">{category ?? "بدون تصنيف"}</p>
      <p className="text-sm text-stone-600">{conditionLabel}</p>
      {ownerName ? <p className="text-sm text-stone-600">صاحبها: {ownerName}</p> : null}
      <Link href={`/items/${itemId}`} className="mt-3 inline-block text-sm underline">افتح الحاجة</Link>
    </div>
  );
}
