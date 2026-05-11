create index if not exists deal_messages_deal_created_idx
on public.deal_messages (deal_id, created_at asc);

create index if not exists deal_messages_sender_created_idx
on public.deal_messages (sender_id, created_at desc);
