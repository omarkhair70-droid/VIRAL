import { AppIcon, type AppIconName } from "@/components/ui/app-icon";
import { SoftPanel, SurfaceCard } from "@/components/ui/surfaces";

type OfferEvent = { id: string; event_type: string; created_at: string; note: string | null; };
const timelineMap: Record<string, { label: string; icon: AppIconName }> = {
  created: { label: "العرض اتبعت", icon: "offer" }, marked_thinking: { label: "صاحب الحاجة محتاج يفكر", icon: "clock" }, accepted: { label: "العرض اتقبل", icon: "check" }, soft_rejected: { label: "العرض ما ظبطش", icon: "warning" }, redirected: { label: "اتفتح باب تاني", icon: "forward" },
};

export function OfferTimeline({ events, hasParentOffer }: { events: OfferEvent[] | null; hasParentOffer: boolean }) {
  const sortedEvents = [...(events ?? [])].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  return <SurfaceCard className="space-y-3 p-4 md:p-5"><h2 className="text-lg font-semibold">الخط الزمني</h2><div className="space-y-3">{hasParentOffer ? <SoftPanel className="flex items-center gap-2 text-sm"><AppIcon name="spark" className="size-4 text-sky-700" />اتعمل كعرض تاني بعد فتح باب تاني.</SoftPanel> : null}{sortedEvents.map((event, index) => { const config = timelineMap[event.event_type] ?? { label: event.event_type, icon: "clock" as AppIconName }; const latest = index === sortedEvents.length - 1; return <div key={event.id} className="flex gap-3"><span className={`mt-1 flex size-7 items-center justify-center rounded-full border ${latest ? "border-clay/50 bg-clay/10 text-clay" : "border-stone-200 bg-stone-50 text-stone-700"}`}><AppIcon name={config.icon} className="size-3.5" /></span><SoftPanel className="min-w-0 flex-1"><p className="text-sm font-medium text-app-text">{config.label}</p><p className="text-xs text-app-text-muted">{new Date(event.created_at).toLocaleDateString("ar-EG")}</p>{event.note ? <p className="mt-1 text-sm text-app-text-muted">{event.note}</p> : null}</SoftPanel></div>; })}{sortedEvents.length === 0 && !hasParentOffer ? <SoftPanel className="text-sm text-app-text-muted">لا توجد أحداث حاليًا.</SoftPanel> : null}</div></SurfaceCard>;
}
