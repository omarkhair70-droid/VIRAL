export const ICON_NAMES = [
  "back",
  "bell",
  "calendar",
  "camera",
  "chat",
  "check",
  "clock",
  "copy",
  "deal",
  "edit",
  "empty-box",
  "feedback",
  "filter",
  "forward",
  "heart",
  "home",
  "image",
  "location",
  "logout",
  "market",
  "menu",
  "offer",
  "profile",
  "publish",
  "report",
  "search",
  "settings",
  "share",
  "shield",
  "spark",
  "star",
  "story",
  "swap",
  "tag",
  "trash",
  "upload",
  "user-plus",
  "warning",
] as const;

export type AppIconName = (typeof ICON_NAMES)[number];

type AppIconProps = {
  name: AppIconName;
  className?: string;
  label?: string;
  decorative?: boolean;
};

export function AppIcon({ name, className, label, decorative = true }: AppIconProps) {
  const shouldExposeLabel = Boolean(label) || !decorative;

  return (
    <span
      className={["inline-block shrink-0 bg-current", className].filter(Boolean).join(" ")}
      style={{
        WebkitMaskImage: `url(/ui-icons/${name}.svg)`,
        maskImage: `url(/ui-icons/${name}.svg)`,
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
      role={shouldExposeLabel ? "img" : undefined}
      aria-label={shouldExposeLabel ? (label ?? name) : undefined}
      aria-hidden={shouldExposeLabel ? undefined : true}
    />
  );
}
