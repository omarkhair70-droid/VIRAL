import Link from "next/link";
import { redirect } from "next/navigation";
import { MessageConversationCard } from "@/components/messages/message-conversation-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeading } from "@/components/ui/page-heading";
import { getMessageConversationsForUser } from "@/lib/messages";
import { createClient } from "@/lib/supabase/server";

export default async function MessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/messages");

  const conversations = await getMessageConversationsForUser(user.id);

  return (
    <section className="mx-auto max-w-5xl space-y-4 px-4 py-8">
      <PageHeading title="رسائلي" subtitle="تابع محادثات التنسيق المرتبطة بصفقاتك، وارجع لأي رسالة محتاجة رد." />
      {conversations.length === 0 ? (
        <EmptyState
          iconName="chat"
          title="لسه مفيش محادثات."
          subtitle="لما عرض يتقبل، رسائل التنسيق هتظهر هنا."
          action={<Link href="/items" className="inline-flex rounded-lg border px-3 py-2 text-sm">شوف السوق</Link>}
        />
      ) : (
        <div className="space-y-3">
          {conversations.map((conversation) => <MessageConversationCard key={conversation.dealId} conversation={conversation} />)}
        </div>
      )}
    </section>
  );
}
