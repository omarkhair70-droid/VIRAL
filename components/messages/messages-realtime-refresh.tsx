"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type RealtimeStatus = "connecting" | "live" | "degraded";

function statusCopy(status: RealtimeStatus) {
  if (status === "live") return "مركز الرسائل بيتحدث لحظيًا";
  if (status === "degraded") return "التحديث اللحظي متوقف مؤقتًا، حدّث الصفحة لو منتظر رسالة.";
  return "بنرجّع الاتصال اللحظي...";
}

export function MessagesRealtimeRefresh({ currentUserId }: { currentUserId: string }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [status, setStatus] = useState<RealtimeStatus>("connecting");
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const queueRefresh = useCallback(() => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(() => router.refresh(), 350);
  }, [router]);

  useEffect(() => {
    const channel = supabase
      .channel(`messages-inbox-${currentUserId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "deal_messages" }, queueRefresh)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "deal_message_reads", filter: `user_id=eq.${currentUserId}` }, queueRefresh)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "deal_message_reads", filter: `user_id=eq.${currentUserId}` }, queueRefresh)
      .subscribe((nextStatus) => {
        if (nextStatus === "SUBSCRIBED") setStatus("live");
        else if (nextStatus === "CHANNEL_ERROR" || nextStatus === "CLOSED" || nextStatus === "TIMED_OUT") setStatus("degraded");
        else setStatus("connecting");
      });

    return () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      void supabase.removeChannel(channel);
    };
  }, [supabase, currentUserId, queueRefresh]);

  return <p className="text-xs text-stone-500">{statusCopy(status)}</p>;
}
