import { sendDealMessage } from "@/app/deals/[dealId]/actions";
import { DealMessageSubmitButton } from "@/components/deals/deal-message-submit-button";
import { Field, HelperText, Label, Textarea } from "@/components/ui/form";

export function DealMessageForm({ dealId }: { dealId: string }) {
  return <form action={sendDealMessage} className="space-y-3"><input type="hidden" name="dealId" value={dealId} /><Field><Label htmlFor="body" required>رسالتك</Label><Textarea id="body" name="body" required minLength={1} maxLength={800} rows={4} placeholder="اكتب رسالة تنسيق بسيطة..." /></Field><HelperText>خليك واضح ومختصر. ما تبعتش عنوانك أو بيانات حساسة بدري.</HelperText><DealMessageSubmitButton /></form>;
}
