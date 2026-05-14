import { createClient } from "@/lib/supabase/server";

type DealStatus = "coordinating" | "completed_pending_confirmation" | "completed" | "cancelled" | "disputed";

type DealBaseRow = {
  id: string;
  created_at: string;
  accepted_at: string | null;
  status: DealStatus;
  requester_id: string;
  offerer_id: string;
  offered_item: Array<{ title: string | null }> | null;
  requested_item: Array<{ title: string | null }> | null;
  requester: Array<{ display_name: string | null; username: string | null; avatar_url: string | null }> | null;
  offerer: Array<{ display_name: string | null; username: string | null; avatar_url: string | null }> | null;
};

type LatestMessageRow = { deal_id: string; body: string; created_at: string; sender_id: string };

type ReadRow = { deal_id: string; last_read_at: string };

export type MessageConversation = {
  dealId: string;
  status: DealStatus;
  dealCreatedAt: string;
  acceptedAt: string | null;
  offeredItemTitle: string;
  requestedItemTitle: string;
  otherParticipant: { id: string; displayName: string; username: string | null; avatarUrl: string | null };
  latestMessage: { body: string; createdAt: string; senderId: string } | null;
  unreadCount: number;
  lastActivityAt: string;
};

export async function getMessageConversationsForUser(userId: string): Promise<MessageConversation[]> {
  const supabase = await createClient();

  const { data: dealsData } = await supabase
    .from("swap_deals")
    .select("id,created_at,accepted_at,status,requester_id,offerer_id,offered_item:items!swap_deals_offered_item_id_fkey(title),requested_item:items!swap_deals_requested_item_id_fkey(title),requester:profiles!swap_deals_requester_id_fkey(display_name,username,avatar_url),offerer:profiles!swap_deals_offerer_id_fkey(display_name,username,avatar_url)")
    .or(`requester_id.eq.${userId},offerer_id.eq.${userId}`);

  const deals = (dealsData as DealBaseRow[] | null) ?? [];
  if (deals.length === 0) return [];

  const dealIds = deals.map((deal) => deal.id);

  const [{ data: latestMessagesData }, { data: readStatesData }, { data: unreadRowsData }] = await Promise.all([
    supabase
      .from("deal_messages")
      .select("deal_id,body,created_at,sender_id")
      .in("deal_id", dealIds)
      .order("created_at", { ascending: false }),
    supabase.from("deal_message_reads").select("deal_id,last_read_at").in("deal_id", dealIds).eq("user_id", userId),
    supabase.from("deal_messages").select("deal_id,created_at,sender_id").in("deal_id", dealIds).neq("sender_id", userId),
  ]);

  const readByDeal = new Map<string, ReadRow>();
  ((readStatesData as ReadRow[] | null) ?? []).forEach((row) => readByDeal.set(row.deal_id, row));

  const latestByDeal = new Map<string, LatestMessageRow>();
  ((latestMessagesData as LatestMessageRow[] | null) ?? []).forEach((row) => {
    if (!latestByDeal.has(row.deal_id)) latestByDeal.set(row.deal_id, row);
  });

  const unreadCountByDeal = new Map<string, number>();
  (unreadRowsData ?? []).forEach((row) => {
    const read = readByDeal.get(row.deal_id);
    const isUnread = !read || new Date(row.created_at).getTime() > new Date(read.last_read_at).getTime();
    if (isUnread) unreadCountByDeal.set(row.deal_id, (unreadCountByDeal.get(row.deal_id) ?? 0) + 1);
  });

  return deals
    .map((deal) => {
      const latest = latestByDeal.get(deal.id) ?? null;
      const otherId = deal.requester_id === userId ? deal.offerer_id : deal.requester_id;
      const otherProfile = deal.requester_id === userId ? deal.offerer?.[0] : deal.requester?.[0];
      const dealFallbackDate = deal.accepted_at ?? deal.created_at;

      return {
        dealId: deal.id,
        status: deal.status,
        dealCreatedAt: deal.created_at,
        acceptedAt: deal.accepted_at,
        offeredItemTitle: deal.offered_item?.[0]?.title ?? "حاجة",
        requestedItemTitle: deal.requested_item?.[0]?.title ?? "حاجة",
        otherParticipant: {
          id: otherId,
          displayName: otherProfile?.display_name ?? otherProfile?.username ?? "مستخدم",
          username: otherProfile?.username ?? null,
          avatarUrl: otherProfile?.avatar_url ?? null,
        },
        latestMessage: latest
          ? { body: latest.body, createdAt: latest.created_at, senderId: latest.sender_id }
          : null,
        unreadCount: unreadCountByDeal.get(deal.id) ?? 0,
        lastActivityAt: latest?.created_at ?? dealFallbackDate,
      } as MessageConversation;
    })
    .sort((a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime());
}

export async function getUnreadMessagesCount(userId: string): Promise<number> {
  const conversations = await getMessageConversationsForUser(userId);
  return conversations.reduce((total, conversation) => total + conversation.unreadCount, 0);
}
