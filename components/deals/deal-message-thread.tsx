"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type DealMessage = {
  id: string;
  senderId: string;
  senderName: string;
  body: string;
  createdAt: string;
};

type RealtimeStatus = "connecting" | "live" | "degraded";

function mapStatusLabel(status: RealtimeStatus) {
  if (status === "live") return "الرسائل بتتحدث لحظيًا";
  if (status === "degraded") return "التحديث اللحظي غير متاح مؤقتًا. الرسائل هتظهر بعد تحديث الصفحة.";
  return "جاري تفعيل التحديث اللحظي...";
}

export function DealMessageThread({
  messages,
  currentUserId,
  dealId,
  otherParticipantName,
}: {
  messages: DealMessage[];
  currentUserId: string;
  dealId: string;
  otherParticipantName: string;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [threadMessages, setThreadMessages] = useState<DealMessage[]>(messages);
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeStatus>("connecting");
  const [deferredReadMark, setDeferredReadMark] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setThreadMessages((prev) => {
      const messageMap = new Map(prev.map((message) => [message.id, message]));
      for (const message of messages) messageMap.set(message.id, message);
      return Array.from(messageMap.values()).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    });
  }, [messages]);

  useEffect(() => {
    const channel = supabase
      .channel(`deal-thread-${dealId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "deal_messages", filter: `deal_id=eq.${dealId}` }, (payload) => {
        const row = payload.new as Record<string, unknown>;
        if (typeof row.id !== "string" || typeof row.sender_id !== "string" || typeof row.body !== "string" || typeof row.created_at !== "string") return;

        const isMine = row.sender_id === currentUserId;
        const nextMessage: DealMessage = {
          id: row.id,
          senderId: row.sender_id,
          senderName: isMine ? "أنت" : otherParticipantName,
          body: row.body,
          createdAt: row.created_at,
        };

        setThreadMessages((prev) => {
          if (prev.some((message) => message.id === nextMessage.id)) return prev;
          const isNearBottom = listRef.current
            ? listRef.current.scrollHeight - listRef.current.scrollTop - listRef.current.clientHeight < 100
            : true;
          const next = [...prev, nextMessage].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          if (isNearBottom) {
            requestAnimationFrame(() => listRef.current?.lastElementChild?.scrollIntoView({ behavior: "smooth", block: "end" }));
          }
          return next;
        });

        if (!isMine) {
          if (document.visibilityState === "visible") {
            void supabase.rpc("mark_deal_thread_read", { p_deal_id: dealId });
          } else {
            setDeferredReadMark(true);
          }
        }
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") setRealtimeStatus("live");
        else if (status === "CHANNEL_ERROR" || status === "CLOSED" || status === "TIMED_OUT") setRealtimeStatus("degraded");
        else setRealtimeStatus("connecting");
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase, dealId, currentUserId, otherParticipantName]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && deferredReadMark) {
        setDeferredReadMark(false);
        void supabase.rpc("mark_deal_thread_read", { p_deal_id: dealId });
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [supabase, dealId, deferredReadMark]);

  const returnTo = `/deals/${dealId}`;

  return (
    <div className="space-y-3">
      <p className="text-xs text-stone-500">{mapStatusLabel(realtimeStatus)}</p>
      {threadMessages.length === 0 ? (
        <div className="rounded-xl border border-dashed p-4 text-sm text-stone-600">
          <p className="font-medium text-stone-800">لسه مفيش رسائل.</p>
          <p className="mt-1">ابدأ برسالة بسيطة توضّح ميعاد أو مكان مناسب.</p>
        </div>
      ) : (
        <div ref={listRef} className="space-y-3">
          {threadMessages.map((message) => {
            const isMine = message.senderId === currentUserId;
            return (
              <article key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl border px-4 py-3 ${isMine ? "border-emerald-200 bg-emerald-50" : "border-stone-200 bg-white"}`}>
                  <p className="text-xs font-semibold text-stone-600">{isMine ? "أنت" : message.senderName}</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-stone-900">{message.body}</p>
                  <p className="mt-2 text-[11px] text-stone-500">{new Date(message.createdAt).toLocaleString("ar-EG")}</p>
                  {!isMine ? (
                    <Link
                      href={`/report?messageId=${encodeURIComponent(message.id)}&returnTo=${encodeURIComponent(returnTo)}#messages`}
                      className="mt-1 inline-block text-xs text-stone-500 hover:text-stone-700 hover:underline"
                    >
                      بلّغ عن الرسالة
                    </Link>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
