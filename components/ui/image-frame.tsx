export function ImageFrame({ imageUrl, title, ratio = "video" }: { imageUrl: string | null; title: string; ratio?: "video" | "square" }) {
  const ratioClass = ratio === "square" ? "aspect-square" : "aspect-video";

  return (
    <div className={`${ratioClass} overflow-hidden rounded-panel border border-app-border bg-app-soft`}>
      {imageUrl ? (
        <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center type-support text-app-text-muted">مفيش صورة</div>
      )}
    </div>
  );
}
