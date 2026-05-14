DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'deal_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.deal_messages;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'deal_message_reads'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.deal_message_reads;
  END IF;
END
$$;
