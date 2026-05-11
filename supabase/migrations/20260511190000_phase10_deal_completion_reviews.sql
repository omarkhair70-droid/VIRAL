create or replace function public.increment_successful_swaps_for_users(user_a uuid, user_b uuid)
returns void
language sql
security invoker
as $$
  update public.profiles
  set successful_swaps_count = successful_swaps_count + 1
  where id in (user_a, user_b);
$$;

do $$
begin
  if exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'reviews' and policyname = 'reviews_self_insert'
  ) then
    execute 'drop policy reviews_self_insert on public.reviews';
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'reviews' and policyname = 'reviews_participant_completed_insert'
  ) then
    execute $policy$
      create policy reviews_participant_completed_insert
      on public.reviews
      for insert
      to authenticated
      with check (
        reviewer_id = auth.uid()
        and reviewer_id <> reviewee_id
        and exists (
          select 1
          from public.swap_deals d
          where d.id = deal_id
            and d.status = 'completed'
            and (
              (d.requester_id = reviewer_id and d.offerer_id = reviewee_id)
              or (d.offerer_id = reviewer_id and d.requester_id = reviewee_id)
            )
        )
      )
    $policy$;
  end if;
end $$;
