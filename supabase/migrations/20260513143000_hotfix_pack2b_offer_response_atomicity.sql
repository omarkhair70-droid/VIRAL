-- Hotfix Pack 2B: atomic offer response RPCs for thinking/soft reject/redirect.

create or replace function public.mark_offer_thinking(
  p_offer_id uuid,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_offer public.offers%rowtype;
  v_note text := nullif(btrim(p_note), '');
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  select * into v_offer from public.offers where id = p_offer_id for update;
  if not found then raise exception 'Offer not found'; end if;

  if v_offer.receiver_id <> v_user_id then
    raise exception 'Only receiver can mark thinking';
  end if;

  if v_offer.status not in ('pending', 'thinking') then
    raise exception 'Offer not respondable';
  end if;

  update public.offers
  set status = 'thinking', responded_at = now()
  where id = p_offer_id;

  insert into public.offer_events (offer_id, actor_id, event_type, old_status, new_status, note)
  values (p_offer_id, v_user_id, 'marked_thinking', v_offer.status, 'thinking', v_note);
end;
$$;

create or replace function public.soft_reject_offer(
  p_offer_id uuid,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_offer public.offers%rowtype;
  v_note text := nullif(btrim(p_note), '');
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  select * into v_offer from public.offers where id = p_offer_id for update;
  if not found then raise exception 'Offer not found'; end if;

  if v_offer.receiver_id <> v_user_id then
    raise exception 'Only receiver can soft reject';
  end if;

  if v_offer.status not in ('pending', 'thinking') then
    raise exception 'Offer not respondable';
  end if;

  update public.offers
  set status = 'soft_rejected', responded_at = now(), public_note = v_note
  where id = p_offer_id;

  insert into public.offer_events (offer_id, actor_id, event_type, old_status, new_status, note)
  values (p_offer_id, v_user_id, 'soft_rejected', v_offer.status, 'soft_rejected', v_note);
end;
$$;

create or replace function public.redirect_offer(
  p_offer_id uuid,
  p_redirect_type public.offer_redirect_type,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_offer public.offers%rowtype;
  v_note text := nullif(btrim(p_note), '');
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  select * into v_offer from public.offers where id = p_offer_id for update;
  if not found then raise exception 'Offer not found'; end if;

  if v_offer.receiver_id <> v_user_id then
    raise exception 'Only receiver can redirect';
  end if;

  if v_offer.status not in ('pending', 'thinking') then
    raise exception 'Offer not respondable';
  end if;

  update public.offers
  set status = 'redirected', responded_at = now(), redirect_type = p_redirect_type, public_note = v_note
  where id = p_offer_id;

  insert into public.offer_events (offer_id, actor_id, event_type, old_status, new_status, note)
  values (p_offer_id, v_user_id, 'redirected', v_offer.status, 'redirected', v_note);
end;
$$;

revoke execute on function public.mark_offer_thinking(uuid, text) from public, anon;
revoke execute on function public.soft_reject_offer(uuid, text) from public, anon;
revoke execute on function public.redirect_offer(uuid, public.offer_redirect_type, text) from public, anon;

grant execute on function public.mark_offer_thinking(uuid, text) to authenticated;
grant execute on function public.soft_reject_offer(uuid, text) to authenticated;
grant execute on function public.redirect_offer(uuid, public.offer_redirect_type, text) to authenticated;
