type NotificationType = "offer_received" | "offer_thinking" | "offer_accepted" | "offer_soft_rejected" | "offer_redirected" | "deal_created" | "deal_completed" | "deal_cancelled" | "report_update" | "system";

type RpcCapableClient = {
  rpc: (
    fn: string,
    params: {
      target_user_id: string;
      notification_type: NotificationType;
      notification_title: string;
      notification_body?: string | null;
      target_item_id?: string | null;
      target_offer_id?: string | null;
      target_deal_id?: string | null;
    },
  ) => Promise<{ error: { message: string } | null }>;
};

type CreateNotificationParams = {
  targetUserId: string;
  notificationType: NotificationType;
  notificationTitle: string;
  notificationBody?: string | null;
  targetItemId?: string | null;
  targetOfferId?: string | null;
  targetDealId?: string | null;
};

export async function createNotification(supabase: RpcCapableClient, params: CreateNotificationParams): Promise<void> {
  const { error } = await supabase.rpc("create_notification", {
    target_user_id: params.targetUserId,
    notification_type: params.notificationType,
    notification_title: params.notificationTitle,
    notification_body: params.notificationBody ?? null,
    target_item_id: params.targetItemId ?? null,
    target_offer_id: params.targetOfferId ?? null,
    target_deal_id: params.targetDealId ?? null,
  });

  if (error) {
    console.error("create_notification rpc skipped", error.message);
  }
}
