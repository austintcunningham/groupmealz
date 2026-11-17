-- Additive catering channel. Office lunch schedules/orders unchanged.

alter table public.restaurants
  add column if not exists supports_catering boolean not null default false,
  add column if not exists catering_live_orders boolean not null default false,
  add column if not exists catering_min_order_cents integer,
  add column if not exists catering_lead_hours integer not null default 24,
  add column if not exists catering_delivery_fee_cents integer not null default 0,
  add column if not exists catering_description text,
  add column if not exists catering_service_area text,
  add column if not exists catering_cuisine text;

comment on column public.restaurants.supports_catering is
  'When true, restaurant appears in public catering browse (may still be demo-only).';
comment on column public.restaurants.catering_live_orders is
  'When false, catering UI is demo/preview and checkout is blocked.';

alter table public.menu_items
  add column if not exists available_for_catering boolean not null default false,
  add column if not exists catering_serves_count integer,
  add column if not exists catering_packaging text;

comment on column public.menu_items.available_for_catering is
  'Catering catalog visibility. Office lunch still uses available.';

alter table public.menu_categories
  add column if not exists catering_only boolean not null default false;

-- Public can read catering-capable restaurants (browse pages use admin/service or anon with RLS).
drop policy if exists "restaurants_public_catering_select" on public.restaurants;
create policy "restaurants_public_catering_select" on public.restaurants
  for select using (active = true and supports_catering = true);

drop policy if exists "menu_items_public_catering_select" on public.menu_items;
create policy "menu_items_public_catering_select" on public.menu_items
  for select using (
    active = true
    and available_for_catering = true
    and exists (
      select 1 from public.restaurants r
      where r.id = menu_items.restaurant_id
        and r.active = true
        and r.supports_catering = true
    )
  );

drop policy if exists "menu_categories_public_catering_select" on public.menu_categories;
create policy "menu_categories_public_catering_select" on public.menu_categories
  for select using (
    active = true
    and exists (
      select 1 from public.restaurants r
      where r.id = menu_categories.restaurant_id
        and r.active = true
        and r.supports_catering = true
    )
  );
