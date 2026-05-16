# 1. What the repo could not confirm
- Whether production Supabase exactly matches repo migrations (possible drift from dashboard/manual SQL).
- Full final definitions for every function if altered outside migrations.
- Full live policy matrix if any post-migration edits occurred.
- Storage bucket metadata (public/private flags, file size limits, MIME rules) not fully declared in migrations.
- Presence of additional live views (e.g., `marketplace_items`) not defined in VIRAL migrations.

# 2. Recommended live Supabase verification queries
```sql
-- 2.1 all public tables
select table_schema, table_name
from information_schema.tables
where table_schema = 'public' and table_type = 'BASE TABLE'
order by table_name;

-- 2.2 all public views
select table_schema, table_name, view_definition
from information_schema.views
where table_schema = 'public'
order by table_name;

-- 2.3 all columns (type/null/default)
select c.table_name, c.ordinal_position, c.column_name, c.data_type, c.udt_name,
       c.is_nullable, c.column_default
from information_schema.columns c
where c.table_schema = 'public'
order by c.table_name, c.ordinal_position;

-- 2.4 all enums and values
select n.nspname as schema_name, t.typname as enum_name, e.enumsortorder, e.enumlabel
from pg_type t
join pg_enum e on t.oid = e.enumtypid
join pg_namespace n on n.oid = t.typnamespace
where n.nspname = 'public'
order by t.typname, e.enumsortorder;

-- 2.5 foreign keys
select tc.table_name,
       kcu.column_name,
       ccu.table_name as foreign_table_name,
       ccu.column_name as foreign_column_name,
       rc.update_rule,
       rc.delete_rule,
       tc.constraint_name
from information_schema.table_constraints tc
join information_schema.key_column_usage kcu
  on tc.constraint_name = kcu.constraint_name and tc.table_schema = kcu.table_schema
join information_schema.constraint_column_usage ccu
  on ccu.constraint_name = tc.constraint_name and ccu.table_schema = tc.table_schema
join information_schema.referential_constraints rc
  on rc.constraint_name = tc.constraint_name and rc.constraint_schema = tc.table_schema
where tc.table_schema = 'public' and tc.constraint_type = 'FOREIGN KEY'
order by tc.table_name, tc.constraint_name;

-- 2.6 primary keys + unique constraints
select tc.table_name, tc.constraint_type, tc.constraint_name,
       string_agg(kcu.column_name, ', ' order by kcu.ordinal_position) as columns
from information_schema.table_constraints tc
left join information_schema.key_column_usage kcu
  on tc.constraint_name = kcu.constraint_name and tc.table_schema = kcu.table_schema
where tc.table_schema = 'public'
  and tc.constraint_type in ('PRIMARY KEY','UNIQUE')
group by tc.table_name, tc.constraint_type, tc.constraint_name
order by tc.table_name, tc.constraint_type;

-- 2.7 indexes
select schemaname, tablename, indexname, indexdef
from pg_indexes
where schemaname = 'public'
order by tablename, indexname;

-- 2.8 triggers
select event_object_table as table_name,
       trigger_name,
       action_timing,
       event_manipulation,
       action_statement
from information_schema.triggers
where trigger_schema = 'public'
order by event_object_table, trigger_name;

-- 2.9 functions and signatures
select n.nspname as schema_name,
       p.proname as function_name,
       pg_get_function_identity_arguments(p.oid) as args,
       pg_get_function_result(p.oid) as returns,
       p.prosecdef as security_definer
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
order by p.proname;

-- 2.10 function bodies (review high-impact RPCs)
select p.proname,
       pg_get_function_identity_arguments(p.oid) as args,
       pg_get_functiondef(p.oid) as definition
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in (
    'accept_offer',
    'complete_deal_if_ready',
    'mark_offer_thinking',
    'soft_reject_offer',
    'redirect_offer',
    'create_notification',
    'mark_deal_thread_read',
    'get_unread_notifications_count',
    'get_unread_deal_messages_count'
  )
order by p.proname;

-- 2.11 RLS enabled status by table
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;

-- 2.12 RLS policies
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- 2.13 storage buckets
select id, name, public, file_size_limit, allowed_mime_types, created_at, updated_at
from storage.buckets
order by name;

-- 2.14 storage policies (objects)
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'storage' and tablename = 'objects'
order by policyname;
```

# 3. Highest-priority questions before M4
- What are the exact required/non-null/default columns for `public.items` in production today?
- Are there any additional insert guards/triggers on `public.items` not present in VIRAL migrations?
- What is the exact insert contract for `public.item_images` (required `is_primary`, `sort_order`, URL constraints)?
- Are `public.categories` readable by anon/authenticated and filtered strictly by `is_active` in production?
- For bucket `item-images`: exact object key prefix convention expected by storage RLS (must include `auth.uid()` prefix?), public flag, max file size, MIME whitelist.
- Is `profile-images` bucket configured similarly, and are there any bucket-level policies beyond app assumptions?

# 4. Highest-priority questions before M5/M6/M7
- Offers:
  - Confirm final `offers` columns, checks, and allowed status transitions.
  - Confirm that offer response RPCs (`mark_offer_thinking`, `soft_reject_offer`, `redirect_offer`, `accept_offer`) are the canonical write path.
- Deals:
  - Confirm exact `swap_deals` lifecycle guard logic and legal transition matrix.
  - Confirm `complete_deal_if_ready` behavior and dependency on `deal_confirmations`.
- Messaging:
  - Confirm `deal_messages` insert policy status-gating and max-length/body constraints.
  - Confirm `deal_message_reads` + `mark_deal_thread_read` semantics for unread badges.
- Notifications:
  - Confirm canonical producer(s): trigger/function/app writes and whether `create_notification` is required.
- Enforcement boundary:
  - Identify what transitions are DB-enforced (function/trigger) vs client-enforced only.
