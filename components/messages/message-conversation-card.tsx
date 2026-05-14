import { MessageConversation } from "@/lib/messages";
import Link from "next/link";
import { CountBadge } from "@/components/ui/product-primitives";
import { StatusPill } from "@/components/ui/status-pill";
import { SoftPanel, SurfaceCard } from "@/components/ui/surfaces";

const statusMap: Record<MessageConversation["status"], { label: string; tone: "pending" | "success" | "muted" | "warning" }> = {
  coordinating: { label: "جاري التنسيق", tone: "pending" }, completed_pending_confirmation: { label: "مستني تأكيد", tone: "pending" }, completed: { label: "تمت المقايضة", tone: "success" }, cancelled: { label: "اتلغت", tone: "muted" }, disputed: { label: "عليها مشكلة", tone: "warning" },
};

export function MessageConversationCard({ conversation }: { conversation: MessageConversation }) {
  return <SurfaceCard className={`space-y-3 p-4 ${conversation.unreadCount > 0 ? "border-clay/40 bg-clay/5" : ""}`}><div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><div className="size-12 overflow-hidden rounded-full bg-stone-100">{conversation.otherParticipant.avatarUrl ? <img src={conversation.otherParticipant.avatarUrl} alt={conversation.otherParticipant.displayName} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-xs text-stone-500">تِسوى</div>}</div><div><p className="font-semibold">{conversation.otherParticipant.displayName}</p>{conversation.otherParticipant.username ? <p className="text-xs text-stone-500">@{conversation.otherParticipant.username}</p> : null}</div></div><StatusPill tone={statusMap[conversation.status].tone}>{statusMap[conversation.status].label}</StatusPill></div>
  <SoftPanel><p className="text-sm font-medium">{conversation.offeredItemTitle} ↔ {conversation.requestedItemTitle}</p><p className="mt-1 line-clamp-2 text-sm text-app-text-muted">{conversation.latestMessage?.body || "لسه مفيش رسائل في الصفقة دي."}</p></SoftPanel>
  <div className="flex items-center justify-between text-xs text-app-text-muted"><span>آخر نشاط: {new Date(conversation.lastActivityAt).toLocaleString("ar-EG")}</span>{conversation.unreadCount > 0 ? <CountBadge count={conversation.unreadCount} /> : <span>مقروءة</span>}</div>
  <Link href={`/deals/${conversation.dealId}#messages`} className="inline-flex min-h-10 rounded-button bg-transparent px-3 py-2 text-sm text-app-text-muted hover:bg-app-soft">افتح الرسائل</Link></SurfaceCard>;
}
