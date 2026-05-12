import { AppIcon, type AppIconName } from "@/components/ui/app-icon";

type OfferEvent = {
  id: string;
  event_type: string;
  created_at: string;
  note: string | null;
};

const timelineMap: Record<string, { label: string; icon: AppIconName }> = {
  created: { label: "العرض اتبعت", icon: "offer" },
  marked_thinking: { label: "صاحب الحاجة محتاج يفكر", icon: "clock" },
  accepted: { label: "العرض اتقبل", icon: "check" },
  soft_rejected: { label: "العرض ما ظبطش", icon: "warning" },
  redirected: { label: "اتفتح باب تاني", icon: "forward" },
};

export function OfferTimeline({ events, hasParentOffer }: { events: OfferEvent[] | null; hasParentOffer: boolean }) {
  const sortedEvents = [...(events ?? [])].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  return (
    <section className="rounded-2xl border bg-white p-4 md:p-5">
      <h2 className="text-lg font-semibold">الخط الزمني</h2>
      <div className="mt-3 space-y-3">
        {hasParentOffer ? (
          <div className="flex gap-3">
            <div className="mt-1 flex size-6 items-center justify-center rounded-full bg-sky-100 text-sky-700">
              <AppIcon name="spark" className="size-3.5" />
            </div>
            <div className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900">اتعمل كعرض تاني بعد فتح باب تاني</div>
          </div>
        ) : null}

        {sortedEvents.map((event, index) => {
          const config = timelineMap[event.event_type] ?? { label: event.event_type, icon: "clock" as AppIconName };
          const isLast = index === sortedEvents.length - 1;

          return (
            <div key={event.id} className="flex gap-3">
              <div className="relative flex w-6 justify-center">
                {!isLast ? <span className="absolute top-7 h-[calc(100%-1.25rem)] w-px bg-stone-200" /> : null}
                <span className="mt-1 flex size-6 items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-stone-700">
                  <AppIcon name={config.icon} className="size-3.5" />
                </span>
              </div>
              <div className="min-w-0 flex-1 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2">
                <p className="text-sm font-medium text-stone-900">{config.label}</p>
                <p className="text-xs text-stone-600">{new Date(event.created_at).toLocaleDateString("ar-EG")}</p>
                {event.note ? <p className="mt-1 text-sm text-stone-700">{event.note}</p> : null}
              </div>
            </div>
          );
        })}

        {sortedEvents.length === 0 && !hasParentOffer ? <p className="text-sm text-stone-600">لا توجد أحداث حالياً.</p> : null}
      </div>
    </section>
  );
}
