create extension if not exists pgcrypto;

create type public.item_condition as enum ('almost_new','good_used','minor_issues','needs_repair');
create type public.item_desire_mode as enum ('specific','flexible','surprise');
create type public.item_status as enum ('active','reserved','swapped','archived','removed');
create type public.item_source as enum ('direct_listing','offer_upload');
create type public.offer_status as enum ('pending','thinking','accepted','soft_rejected','redirected','withdrawn','expired','cancelled_after_accept');
create type public.offer_redirect_type as enum ('offer_another_item','ask_for_different_item','update_preferences');
create type public.offer_event_type as enum ('created','marked_thinking','accepted','soft_rejected','redirected','withdrawn','expired','cancelled_after_accept','completed');
create type public.deal_status as enum ('coordinating','completed_pending_confirmation','completed','cancelled','disputed');
create type public.discovery_example_type as enum ('completed_swap','possible_swap','demand_hint');
create type public.report_reason as enum ('misleading_item','inappropriate_content','spam_offer','unsafe_behavior','no_show','other');
create type public.report_status as enum ('open','reviewing','resolved','dismissed');
create type public.notification_type as enum ('offer_received','offer_thinking','offer_accepted','offer_soft_rejected','offer_redirected','deal_created','deal_completed','deal_cancelled','report_update','system');

create function public.set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end $$;

create table public.profiles (id uuid primary key references auth.users(id) on delete cascade, display_name text not null, username text unique, avatar_url text, city text, area text, bio text, successful_swaps_count integer not null default 0, response_rate numeric, is_banned boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.categories (id uuid primary key default gen_random_uuid(), name_ar text not null, name_en text, slug text not null unique, sort_order integer not null default 0, is_active boolean not null default true, created_at timestamptz not null default now());
create table public.items (id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.profiles(id) on delete cascade, category_id uuid references public.categories(id) on delete set null, title text not null, description text, condition item_condition not null default 'good_used', condition_notes text, city text, area text, desire_mode item_desire_mode not null default 'flexible', desire_text text, status item_status not null default 'active', source item_source not null default 'direct_listing', created_from_offer_id uuid, view_count integer not null default 0, offer_count integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.item_images (id uuid primary key default gen_random_uuid(), item_id uuid not null references public.items(id) on delete cascade, image_url text not null, alt_text text, sort_order integer not null default 0, is_primary boolean not null default false, created_at timestamptz not null default now());
create table public.item_wanted_tags (id uuid primary key default gen_random_uuid(), item_id uuid not null references public.items(id) on delete cascade, tag text not null, created_at timestamptz not null default now());
create table public.offers (id uuid primary key default gen_random_uuid(), requested_item_id uuid not null references public.items(id) on delete cascade, offered_item_id uuid not null references public.items(id) on delete cascade, sender_id uuid not null references public.profiles(id) on delete cascade, receiver_id uuid not null references public.profiles(id) on delete cascade, status offer_status not null default 'pending', message text, parent_offer_id uuid references public.offers(id) on delete set null, redirect_type offer_redirect_type, public_note text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), responded_at timestamptz, check (sender_id <> receiver_id), check (requested_item_id <> offered_item_id));
alter table public.items add constraint items_created_from_offer_fk foreign key (created_from_offer_id) references public.offers(id) on delete set null;
create table public.offer_events (id uuid primary key default gen_random_uuid(), offer_id uuid not null references public.offers(id) on delete cascade, actor_id uuid references public.profiles(id) on delete set null, event_type offer_event_type not null, old_status text, new_status text, note text, created_at timestamptz not null default now());
create table public.swap_deals (id uuid primary key default gen_random_uuid(), offer_id uuid not null unique references public.offers(id) on delete cascade, requested_item_id uuid not null references public.items(id) on delete restrict, offered_item_id uuid not null references public.items(id) on delete restrict, requester_id uuid not null references public.profiles(id) on delete restrict, offerer_id uuid not null references public.profiles(id) on delete restrict, status deal_status not null default 'coordinating', accepted_at timestamptz not null default now(), completed_at timestamptz, cancelled_at timestamptz, public_story text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.deal_messages (id uuid primary key default gen_random_uuid(), deal_id uuid not null references public.swap_deals(id) on delete cascade, sender_id uuid not null references public.profiles(id) on delete cascade, body text not null, created_at timestamptz not null default now());
create table public.deal_confirmations (id uuid primary key default gen_random_uuid(), deal_id uuid not null references public.swap_deals(id) on delete cascade, user_id uuid not null references public.profiles(id) on delete cascade, confirmed_at timestamptz not null default now(), note text, unique(deal_id,user_id));
create table public.reviews (id uuid primary key default gen_random_uuid(), deal_id uuid not null references public.swap_deals(id) on delete cascade, reviewer_id uuid not null references public.profiles(id) on delete cascade, reviewee_id uuid not null references public.profiles(id) on delete cascade, rating integer not null check (rating between 1 and 5), comment text, created_at timestamptz not null default now(), unique(deal_id,reviewer_id,reviewee_id));
create table public.reports (id uuid primary key default gen_random_uuid(), reporter_id uuid not null references public.profiles(id) on delete cascade, reported_user_id uuid references public.profiles(id) on delete set null, item_id uuid references public.items(id) on delete set null, offer_id uuid references public.offers(id) on delete set null, deal_id uuid references public.swap_deals(id) on delete set null, reason report_reason not null, details text, status report_status not null default 'open', created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.notifications (id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade, type notification_type not null, title text not null, body text, item_id uuid references public.items(id) on delete set null, offer_id uuid references public.offers(id) on delete set null, deal_id uuid references public.swap_deals(id) on delete set null, read_at timestamptz, created_at timestamptz not null default now());
create table public.discovery_examples (id uuid primary key default gen_random_uuid(), query_term text not null, category_id uuid references public.categories(id) on delete set null, example_type discovery_example_type not null, title text not null, description text, requested_label text, offered_label text, is_real boolean not null default false, source_offer_id uuid references public.offers(id) on delete set null, source_deal_id uuid references public.swap_deals(id) on delete set null, created_at timestamptz not null default now());

create trigger profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
create trigger items_updated before update on public.items for each row execute function public.set_updated_at();
create trigger offers_updated before update on public.offers for each row execute function public.set_updated_at();
create trigger swap_deals_updated before update on public.swap_deals for each row execute function public.set_updated_at();
create trigger reports_updated before update on public.reports for each row execute function public.set_updated_at();

create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
insert into public.profiles (id, display_name)
values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1), 'مستخدم جديد'))
on conflict (id) do nothing;
return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security; alter table public.categories enable row level security; alter table public.items enable row level security; alter table public.item_images enable row level security; alter table public.item_wanted_tags enable row level security; alter table public.offers enable row level security; alter table public.offer_events enable row level security; alter table public.swap_deals enable row level security; alter table public.deal_messages enable row level security; alter table public.deal_confirmations enable row level security; alter table public.reviews enable row level security; alter table public.reports enable row level security; alter table public.notifications enable row level security; alter table public.discovery_examples enable row level security;

create policy profiles_public_select on public.profiles for select using (is_banned = false);
create policy profiles_self_insert on public.profiles for insert to authenticated with check (id = auth.uid());
create policy profiles_self_update on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy categories_public_select on public.categories for select using (is_active = true);
create policy items_public_select on public.items for select using (status in ('active','reserved','swapped'));
create policy items_owner_insert on public.items for insert to authenticated with check (owner_id = auth.uid());
create policy items_owner_update on public.items for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy item_images_public_select on public.item_images for select using (exists (select 1 from public.items i where i.id=item_id and i.status in ('active','reserved','swapped')));
create policy item_images_owner_all on public.item_images for all to authenticated using (exists (select 1 from public.items i where i.id=item_id and i.owner_id=auth.uid())) with check (exists (select 1 from public.items i where i.id=item_id and i.owner_id=auth.uid()));
create policy item_tags_public_select on public.item_wanted_tags for select using (exists (select 1 from public.items i where i.id=item_id and i.status in ('active','reserved','swapped')));
create policy item_tags_owner_all on public.item_wanted_tags for all to authenticated using (exists (select 1 from public.items i where i.id=item_id and i.owner_id=auth.uid())) with check (exists (select 1 from public.items i where i.id=item_id and i.owner_id=auth.uid()));
create policy offers_public_select on public.offers for select using (true);
create policy offers_sender_insert on public.offers for insert to authenticated with check (sender_id = auth.uid());
create policy offers_participant_update on public.offers for update to authenticated using (sender_id = auth.uid() or receiver_id = auth.uid()) with check (sender_id = auth.uid() or receiver_id = auth.uid());
create policy offer_events_public_select on public.offer_events for select using (true);
create policy offer_events_participant_insert on public.offer_events for insert to authenticated with check (exists (select 1 from public.offers o where o.id=offer_id and (o.sender_id = auth.uid() or o.receiver_id = auth.uid())));
create policy deals_participant_select on public.swap_deals for select to authenticated using (requester_id=auth.uid() or offerer_id=auth.uid());
create policy deals_participant_update on public.swap_deals for update to authenticated using (requester_id=auth.uid() or offerer_id=auth.uid()) with check (requester_id=auth.uid() or offerer_id=auth.uid());
create policy deal_messages_participant_select on public.deal_messages for select to authenticated using (exists(select 1 from public.swap_deals d where d.id=deal_id and (d.requester_id=auth.uid() or d.offerer_id=auth.uid())));
create policy deal_messages_participant_insert on public.deal_messages for insert to authenticated with check (sender_id = auth.uid() and exists(select 1 from public.swap_deals d where d.id=deal_id and (d.requester_id=auth.uid() or d.offerer_id=auth.uid())));
create policy deal_confirmations_participant_select on public.deal_confirmations for select to authenticated using (exists(select 1 from public.swap_deals d where d.id=deal_id and (d.requester_id=auth.uid() or d.offerer_id=auth.uid())));
create policy deal_confirmations_participant_insert on public.deal_confirmations for insert to authenticated with check (user_id = auth.uid() and exists(select 1 from public.swap_deals d where d.id=deal_id and (d.requester_id=auth.uid() or d.offerer_id=auth.uid())));
create policy reviews_public_select on public.reviews for select using (true);
create policy reviews_self_insert on public.reviews for insert to authenticated with check (reviewer_id = auth.uid());
create policy reports_self_insert on public.reports for insert to authenticated with check (reporter_id = auth.uid());
create policy reports_self_select on public.reports for select to authenticated using (reporter_id = auth.uid());
create policy notifications_self_select on public.notifications for select to authenticated using (user_id = auth.uid());
create policy notifications_self_update on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy discovery_public_select on public.discovery_examples for select using (true);

insert into public.categories (name_ar,name_en,slug,sort_order) values
('حاجات البيت','Home Things','home-things',1),('لبس وإكسسوارات','Fashion & Accessories','fashion-accessories',2),('إلكترونيات خفيفة','Light Electronics','light-electronics',3),('كتب وهوايات','Books & Hobbies','books-hobbies',4),('نباتات وديكور','Plants & Decor','plants-decor',5),('حاجات غريبة','Weird Things','weird-things',6)
on conflict (slug) do update set name_ar=excluded.name_ar,name_en=excluded.name_en,sort_order=excluded.sort_order,is_active=true;

insert into public.discovery_examples (query_term,category_id,example_type,title,requested_label,offered_label,is_real)
select x.query_term, c.id, 'possible_swap'::public.discovery_example_type, x.title, x.requested_label, x.offered_label, false
from (values
('سفرة','home-things','سفرة؟ دي ممكن تفتح باب لحاجات للبيت','سفرة','مروحة، كرسي مكتب، نباتة كبيرة'),
('جاكيت','fashion-accessories','جاكيت شتوي؟ ممكن يجيبلك حاجة فاجئني','جاكيت','ساعة بسيطة، شنطة، كتابين مميزين'),
('مخدة','home-things','مخدة فايبر؟ ممكن تبقى أغرب صفقة في اليوم','مخدة فايبر','أدوات مطبخ، نباتات، حاجة للبيت'),
('كاميرا','light-electronics','كاميرا قديمة؟ مش لازم تتباع عشان تعيش تاني','كاميرا','لينس، إضاءة مكتب، ميكروفون صغير'),
('كرسي','home-things','كرسي زيادة؟ ممكن يبقى بداية تبادل لذيذ','كرسي','ترابيزة جانبية، أباجورة، رف صغير'),
('كتب','books-hobbies','كتب مركونة؟ كل كتاب عنده صاحب تاني','كتب','لعبة بورد، نباتة، ديكور بسيط'),
('نباتات','plants-decor','نباتاتك ممكن تعمل صفقة أهدى من البيع','نباتات','أصيص مميز، رف خشب، كتاب فني')
) as x(query_term,category_slug,title,requested_label,offered_label)
join public.categories c on c.slug = x.category_slug
on conflict do nothing;
