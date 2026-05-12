alter table public.items
  add column if not exists item_story text,
  add column if not exists swap_reason text,
  add column if not exists good_for text;

alter table public.items
  add constraint items_item_story_length_check check (item_story is null or char_length(item_story) <= 600),
  add constraint items_swap_reason_length_check check (swap_reason is null or char_length(swap_reason) <= 240),
  add constraint items_good_for_length_check check (good_for is null or char_length(good_for) <= 240);
