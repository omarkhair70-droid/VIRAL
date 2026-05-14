"use client";

import { useFormStatus } from "react-dom";

export function DealMessageSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className="rounded-lg bg-clay px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-70">
      {pending ? "جاري الإرسال..." : "ابعت الرسالة"}
    </button>
  );
}
