import { DealMessageSubmitButton } from "@/components/deals/deal-message-submit-button";
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
      <p className="text-xs text-stone-600">خليك واضح ومختصر. ما تبعتش عنوانك أو بيانات حساسة بدري.</p>
      <DealMessageSubmitButton />
    </form>
  );
}
