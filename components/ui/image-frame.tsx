export function ImageFrame({ imageUrl, title, ratio = "video" }: { imageUrl: string | null; title: string; ratio?: "video" | "square" }) {
  const ratioClass = ratio === "square" ? "aspect-square" : "aspect-video";
  return <div className={`${ratioClass} overflow-hidden rounded-xl bg-stone-100`}>{imageUrl ? <img src={imageUrl} alt={title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-sm text-stone-500">مفيش صورة</div>}</div>;
}
