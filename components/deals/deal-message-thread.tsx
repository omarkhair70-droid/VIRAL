import Link from "next/link";

type DealMessage = {
  id: string;
  senderId: string;
  senderName: string;
  body: string;
  createdAt: string;
};

export function DealMessageThread({ messages, currentUserId, dealId }: { messages: DealMessage[]; currentUserId: string; dealId: string }) {
  if (messages.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-4 text-sm text-stone-600">
        <p className="font-medium text-stone-800">لسه مفيش رسائل.</p>
        <p className="mt-1">ابدأ برسالة بسيطة توضّح ميعاد أو مكان مناسب.</p>
      </div>
    );
  }

  const returnTo = `/deals/${dealId}`;

  return (
    <div className="space-y-3">
      {messages.map((message) => {
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
  );
}
