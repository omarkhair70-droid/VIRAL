
import { redirect } from "next/navigation";
import { MessageConversationCard } from "@/components/messages/message-conversation-card";
import { MessagesRealtimeRefresh } from "@/components/messages/messages-realtime-refresh";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { HeroPanel, PageSection, PageShell, SurfaceCard } from "@/components/ui/surfaces";
import { getMessageConversationsForUser } from "@/lib/messages";
import { createClient } from "@/lib/supabase/server";

export default async function MessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/messages");

  const conversations = await getMessageConversationsForUser(user.id);

  return (
    <PageShell className="mx-auto max-w-5xl px-4 py-8"><PageSection className="space-y-4">
      <HeroPanel className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-bold">رسائلي</h1><p className="text-sm text-app-text-muted">تابع محادثات التنسيق المرتبطة بصفقاتك، والرسائل الجديدة هتظهر لحظيًا.</p></div><ButtonLink href="/deals" variant="secondary" size="sm">افتح الصفقات</ButtonLink></HeroPanel>
      <MessagesRealtimeRefresh currentUserId={user.id} />
      {conversations.length === 0 ? (
        <EmptyState
          iconName="chat"
          title="لسه مفيش محادثات."
          subtitle="لما عرض يتقبل، رسائل التنسيق هتظهر هنا."
          action={<ButtonLink href="/items" variant="secondary" size="sm">شوف السوق</ButtonLink>}
        />
      ) : (
        <SurfaceCard className="space-y-3 p-3">
          {conversations.map((conversation) => <MessageConversationCard key={conversation.dealId} conversation={conversation} />)}
        </SurfaceCard>
      )}
    </PageSection></PageShell>
  );
}
