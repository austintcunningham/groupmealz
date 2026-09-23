-- Verified reviews: one per paid order, tied to restaurant (and office for context).

create table if not exists public.restaurant_reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  office_id uuid not null references public.offices(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  reviewer_name text not null,
  rating int not null check (rating >= 1 and rating <= 5),
  comment text not null default '' check (char_length(comment) <= 2000),
  created_at timestamptz not null default now()
);

create index if not exists restaurant_reviews_restaurant_created
  on public.restaurant_reviews (restaurant_id, created_at desc);

alter table public.restaurant_reviews enable row level security;

create policy "restaurant_reviews_admin_all" on public.restaurant_reviews
  for all using (public.is_admin()) with check (public.is_admin());

create policy "restaurant_reviews_manager_select" on public.restaurant_reviews
  for select using (
    restaurant_id in (select public.my_restaurant_ids())
  );

grant select on public.restaurant_reviews to authenticated;
grant all on public.restaurant_reviews to authenticated;
