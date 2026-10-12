-- Per-item size options (individual prices) and removable ingredients for customer customization.

create table public.menu_item_sizes (
  id uuid primary key default gen_random_uuid(),
  menu_item_id uuid not null references public.menu_items(id) on delete cascade,
  name text not null,
  price_cents int not null check (price_cents >= 0),
  display_order int not null default 0,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index menu_item_sizes_menu_item_id_idx on public.menu_item_sizes(menu_item_id);

create table public.menu_item_ingredients (
  id uuid primary key default gen_random_uuid(),
  menu_item_id uuid not null references public.menu_items(id) on delete cascade,
  name text not null,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create index menu_item_ingredients_menu_item_id_idx on public.menu_item_ingredients(menu_item_id);

alter table public.order_items
  add column if not exists size_label_snapshot text,
  add column if not exists removed_ingredients jsonb not null default '[]'::jsonb;

comment on column public.order_items.size_label_snapshot is 'Chosen size name at order time, e.g. Large';
comment on column public.order_items.removed_ingredients is 'JSON array of ingredient names the customer opted out of';

alter table public.menu_item_sizes enable row level security;
alter table public.menu_item_ingredients enable row level security;

create policy "menu_item_sizes_admin_all" on public.menu_item_sizes
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "menu_item_sizes_manager_all" on public.menu_item_sizes
  for all using (
    exists (
      select 1 from public.menu_items m
      join public.restaurant_users ru on ru.restaurant_id = m.restaurant_id
      where m.id = menu_item_sizes.menu_item_id and ru.user_id = auth.uid()
    )
  );

create policy "menu_item_sizes_public_select" on public.menu_item_sizes
  for select using (
    exists (
      select 1 from public.menu_items m
      where m.id = menu_item_sizes.menu_item_id and m.active = true and m.available = true
    )
  );

create policy "menu_item_ingredients_admin_all" on public.menu_item_ingredients
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "menu_item_ingredients_manager_all" on public.menu_item_ingredients
  for all using (
    exists (
      select 1 from public.menu_items m
      join public.restaurant_users ru on ru.restaurant_id = m.restaurant_id
      where m.id = menu_item_ingredients.menu_item_id and ru.user_id = auth.uid()
    )
  );

create policy "menu_item_ingredients_public_select" on public.menu_item_ingredients
  for select using (
    exists (
      select 1 from public.menu_items m
      where m.id = menu_item_ingredients.menu_item_id and m.active = true and m.available = true
    )
  );
