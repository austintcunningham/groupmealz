-- Temporary kitchen notices (e.g. "Out of lettuce") shown on the customer order page.

create table public.restaurant_notices (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null,
  constraint restaurant_notices_message_len check (
    char_length(trim(message)) between 1 and 120
  )
);

create index restaurant_notices_restaurant_id_idx
  on public.restaurant_notices (restaurant_id, created_at desc);

alter table public.restaurant_notices enable row level security;

create policy "restaurant_notices_admin_all" on public.restaurant_notices
  for all using (public.is_admin()) with check (public.is_admin());

create policy "restaurant_notices_manager_all" on public.restaurant_notices
  for all
  using (restaurant_id in (select public.my_restaurant_ids()))
  with check (restaurant_id in (select public.my_restaurant_ids()));

-- Anyone can read notices for active restaurants (order pages / previews).
create policy "restaurant_notices_select_active" on public.restaurant_notices
  for select using (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_notices.restaurant_id
        and r.active = true
    )
  );
