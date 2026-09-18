-- Major Menus style: office order links + guest checkout (no account required)

alter table public.offices
  add column if not exists slug text;

create unique index if not exists offices_slug_unique on public.offices (slug)
  where slug is not null;

-- Guest orders: no Supabase auth user required (created via server actions)
alter table public.orders
  alter column user_id drop not null;

-- Public read of open schedules by office (anon can see when lunch is orderable)
drop policy if exists "schedules_public_open_select" on public.daily_lunch_schedules;
create policy "schedules_public_open_select" on public.daily_lunch_schedules
  for select using (status in ('open', 'closed', 'sent_to_restaurant'));

-- Public menu read when restaurant has an open schedule for that office
drop policy if exists "menu_items_public_open_select" on public.menu_items;
create policy "menu_items_public_open_select" on public.menu_items
  for select using (
    active = true
    and available = true
    and exists (
      select 1 from public.daily_lunch_schedules dls
      where dls.restaurant_id = menu_items.restaurant_id
        and dls.status = 'open'
        and dls.order_opens_at <= now()
        and dls.order_cutoff_at > now()
    )
  );

drop policy if exists "menu_categories_public_open_select" on public.menu_categories;
create policy "menu_categories_public_open_select" on public.menu_categories
  for select using (
    active = true
    and exists (
      select 1 from public.daily_lunch_schedules dls
      where dls.restaurant_id = menu_categories.restaurant_id
        and dls.status = 'open'
        and dls.order_opens_at <= now()
        and dls.order_cutoff_at > now()
    )
  );
