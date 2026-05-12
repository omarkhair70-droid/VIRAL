import { AppIcon, type AppIconName } from "@/components/ui/app-icon";

type AppLoadingStateProps = {
  title?: string;
  subtitle?: string;
  iconName?: AppIconName;
};

export function AppLoadingState({ title = "جاري التحميل", subtitle = "بنجهز لك المحتوى في ثواني.", iconName = "swap" }: AppLoadingStateProps) {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="rounded-3xl border border-warmBorder bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-clay">
          <span className="rounded-xl bg-clay/10 p-2">
            <AppIcon name={iconName} className="h-4 w-4" />
          </span>
          <div>
            <p className="font-semibold text-ink">{title}</p>
            <p className="text-sm text-muted">{subtitle}</p>
          </div>
        </div>

        <div className="space-y-3" aria-hidden>
          <div className="h-20 animate-pulse rounded-2xl bg-sand" />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="h-16 animate-pulse rounded-xl bg-sand" />
            <div className="h-16 animate-pulse rounded-xl bg-sand" />
          </div>
          <div className="h-14 animate-pulse rounded-xl bg-sand" />
        </div>
      </div>
    </section>
  );
}
