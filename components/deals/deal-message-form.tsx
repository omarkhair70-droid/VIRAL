import { sendDealMessage } from "@/app/deals/[dealId]/actions";

export function DealMessageForm({ dealId }: { dealId: string }) {
  return (
    <form action={sendDealMessage} className="space-y-3">
      <input type="hidden" name="dealId" value={dealId} />
      <label className="block text-sm font-medium text-stone-700" htmlFor="body">
        رسالتك
      </label>
      <textarea
        id="body"
        name="body"
        required
        minLength={1}
        maxLength={800}
        rows={4}
        className="w-full rounded-xl border p-3 text-sm"
        placeholder="اكتب رسالة تنسيق بسيطة..."
      />
      <p className="text-xs text-stone-600">خليك واضح ومختصر. لو الطرف التاني ضغط عليك أو بعت حاجة مش مريحة، بلّغ عن الرسالة.</p>
      <button className="rounded-lg bg-clay px-4 py-2 text-sm text-white">ابعت الرسالة</button>
    </form>
  );
}
