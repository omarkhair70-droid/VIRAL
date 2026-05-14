import { AppIcon, type AppIconName } from "@/components/ui/app-icon";

type AppLoadingStateProps = {
  title?: string;
  subtitle?: string;
  iconName?: AppIconName;
};

export function AppLoadingState({ title = "جاري التحميل", subtitle = "بنجهز لك المحتوى في ثواني.", iconName = "swap" }: AppLoadingStateProps) {
  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-8 sm:py-10" aria-live="polite" aria-busy>
      <div className="rounded-panel border border-app-border bg-app-surface p-panel-md shadow-[0_14px_30px_rgba(31,41,55,0.06)] sm:p-panel-lg">
        <div className="mb-5 flex items-start gap-3">
          <span className="mt-0.5 rounded-xl bg-app-soft p-2 text-app-accent">
            <AppIcon name={iconName} className="h-4 w-4" />
          </span>
          <div>
            <p className="type-meta text-app-accent">حالة النظام</p>
            <p className="type-card-title mt-1">{title}</p>
            <p className="type-support mt-1">{subtitle}</p>
          </div>
        </div>

        <div className="space-y-3" aria-hidden>
          <div className="h-24 animate-pulse rounded-panel bg-app-soft motion-reduce:animate-none" />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="h-16 animate-pulse rounded-panel bg-app-soft motion-reduce:animate-none" />
            <div className="h-16 animate-pulse rounded-panel bg-app-soft motion-reduce:animate-none" />
          </div>
          <div className="h-14 animate-pulse rounded-panel bg-app-soft motion-reduce:animate-none" />
        </div>
      </div>
    </section>
  );
}
