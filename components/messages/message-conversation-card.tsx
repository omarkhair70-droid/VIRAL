import Link from "next/link";
import { MessageConversation } from "@/lib/messages";
import { StatusPill } from "@/components/ui/status-pill";

const statusMap: Record<MessageConversation["status"], { label: string; tone: "pending" | "success" | "muted" | "warning" }> = {
  coordinating: { label: "جاري التنسيق", tone: "pending" },
  completed_pending_confirmation: { label: "مستني تأكيد", tone: "pending" },
  completed: { label: "تمت المقايضة", tone: "success" },
  cancelled: { label: "اتلغت", tone: "muted" },
  disputed: { label: "عليها مشكلة", tone: "warning" },
};

export function MessageConversationCard({ conversation }: { conversation: MessageConversation }) {
  return (
    <article className={`rounded-2xl border bg-white p-4 ${conversation.unreadCount > 0 ? "border-clay/40 shadow-sm" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="size-12 overflow-hidden rounded-full bg-stone-100">
            {conversation.otherParticipant.avatarUrl ? (
              <img src={conversation.otherParticipant.avatarUrl} alt={conversation.otherParticipant.displayName} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-stone-500">تِسوى</div>
            )}
          </div>
          <div>
            <p className="font-semibold">{conversation.otherParticipant.displayName}</p>
            {conversation.otherParticipant.username ? <p className="text-xs text-stone-500">@{conversation.otherParticipant.username}</p> : null}
          </div>
        </div>
        <div className="text-end">
          <StatusPill tone={statusMap[conversation.status].tone}>{statusMap[conversation.status].label}</StatusPill>
          <p className="mt-1 text-xs text-stone-500">آخر نشاط: {new Date(conversation.lastActivityAt).toLocaleString("ar-EG")}</p>
        </div>
      </div>

      <div className="mt-3 rounded-xl bg-stone-50 p-3 text-sm">
        <p className="font-medium">{conversation.offeredItemTitle} ↔ {conversation.requestedItemTitle}</p>
        <p className="mt-2 text-stone-700">
          {conversation.latestMessage?.body ? conversation.latestMessage.body : "لسه مفيش رسائل في الصفقة دي."}
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between">
        {conversation.unreadCount > 0 ? <span className="rounded-full bg-clay px-2.5 py-1 text-xs font-semibold text-white">{conversation.unreadCount} غير مقروءة</span> : <span className="text-xs text-stone-500">كل الرسائل مقروءة</span>}
        <Link href={`/deals/${conversation.dealId}#messages`} className="inline-flex rounded-lg border px-3 py-1.5 text-sm hover:bg-stone-50">افتح الرسائل</Link>
      </div>
    </article>
  );
}
