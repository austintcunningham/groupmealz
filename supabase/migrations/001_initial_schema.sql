-- Office Lunch Platform — initial schema, RLS, and helpers

-- Extensions
create extension if not exists "pgcrypto";

-- Enums via check constraints are defined on tables below.

-- ---------------------------------------------------------------------------
-- updated_at trigger (no table dependencies — safe to create first)
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  phone text,
  role text not null default 'employee'
    check (role in ('admin', 'restaurant_manager', 'office_admin', 'employee')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'role', 'employee')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- restaurants
-- ---------------------------------------------------------------------------

create table public.restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  logo_url text,
  street_address text,
  city text,
  state text,
  zip text,
  phone text,
  email text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger restaurants_updated_at
  before update on public.restaurants
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- restaurant_users
-- ---------------------------------------------------------------------------

create table public.restaurant_users (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (restaurant_id, user_id)
);

-- ---------------------------------------------------------------------------
-- offices
-- ---------------------------------------------------------------------------

create table public.offices (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company_name text,
  street_address text not null,
  suite text,
  city text,
  state text,
  zip text,
  delivery_instructions text,
  contact_name text,
  contact_phone text,
  contact_email text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger offices_updated_at
  before update on public.offices
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- office_users
-- ---------------------------------------------------------------------------

create table public.office_users (
  id uuid primary key default gen_random_uuid(),
  office_id uuid not null references public.offices(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'employee'
    check (role in ('office_admin', 'employee')),
  created_at timestamptz not null default now(),
  unique (office_id, user_id)
);

-- ---------------------------------------------------------------------------
-- menu_categories
-- ---------------------------------------------------------------------------

create table public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  display_order int not null default 0,
  active boolean not null default true
);

-- ---------------------------------------------------------------------------
-- menu_items
-- ---------------------------------------------------------------------------

create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  category_id uuid references public.menu_categories(id) on delete set null,
  name text not null,
  description text,
  price_cents int not null check (price_cents >= 0),
  active boolean not null default true,
  available boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger menu_items_updated_at
  before update on public.menu_items
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- daily_lunch_schedules
-- ---------------------------------------------------------------------------

create table public.daily_lunch_schedules (
  id uuid primary key default gen_random_uuid(),
  office_id uuid not null references public.offices(id) on delete cascade,
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  lunch_date date not null,
  order_cutoff_at timestamptz not null,
  delivery_at timestamptz not null,
  status text not null default 'draft'
    check (status in ('draft', 'open', 'closed', 'sent_to_restaurant', 'delivered', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (office_id, lunch_date)
);

create trigger daily_lunch_schedules_updated_at
  before update on public.daily_lunch_schedules
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------------------

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references public.daily_lunch_schedules(id),
  office_id uuid not null references public.offices(id),
  restaurant_id uuid not null references public.restaurants(id),
  user_id uuid not null references public.profiles(id),
  customer_name text not null,
  customer_email text not null,
  subtotal_cents int not null,
  tax_cents int not null default 0,
  platform_fee_cents int not null default 0,
  total_cents int not null,
  payout_due_cents int not null default 0,
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'paid', 'cancelled', 'failed')),
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  payment_status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- order_items
-- ---------------------------------------------------------------------------

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  menu_item_id uuid references public.menu_items(id),
  item_name_snapshot text not null,
  base_price_cents int not null,
  quantity int not null check (quantity > 0),
  special_instructions text,
  line_total_cents int not null
);

-- ---------------------------------------------------------------------------
-- platform_settings
-- ---------------------------------------------------------------------------

create table public.platform_settings (
  id uuid primary key default gen_random_uuid(),
  platform_fee_type text not null default 'flat'
    check (platform_fee_type in ('flat', 'percentage', 'hybrid')),
  flat_fee_cents int not null default 250,
  percentage_bps int not null default 0,
  sales_tax_bps int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger platform_settings_updated_at
  before update on public.platform_settings
  for each row execute function public.set_updated_at();

insert into public.platform_settings (platform_fee_type, flat_fee_cents, percentage_bps, sales_tax_bps)
values ('flat', 250, 0, 0);

-- ---------------------------------------------------------------------------
-- audit_log
-- ---------------------------------------------------------------------------

create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.profiles(id),
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Helper functions for RLS (must run AFTER all tables exist)
-- ---------------------------------------------------------------------------

create or replace function public.get_my_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_restaurant_manager_for(p_restaurant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.restaurant_users ru
    join public.profiles p on p.id = ru.user_id
    where ru.restaurant_id = p_restaurant_id
      and ru.user_id = auth.uid()
      and p.role = 'restaurant_manager'
  );
$$;

create or replace function public.is_office_member(p_office_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.office_users ou
    where ou.office_id = p_office_id and ou.user_id = auth.uid()
  );
$$;

create or replace function public.is_office_admin_for(p_office_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.office_users ou
    join public.profiles p on p.id = ou.user_id
    where ou.office_id = p_office_id
      and ou.user_id = auth.uid()
      and ou.role = 'office_admin'
      and p.role = 'office_admin'
  );
$$;

create or replace function public.my_office_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select office_id from public.office_users where user_id = auth.uid();
$$;

create or replace function public.my_restaurant_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select restaurant_id from public.restaurant_users where user_id = auth.uid();
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.restaurants enable row level security;
alter table public.restaurant_users enable row level security;
alter table public.offices enable row level security;
alter table public.office_users enable row level security;
alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.daily_lunch_schedules enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.platform_settings enable row level security;
alter table public.audit_log enable row level security;

-- profiles
create policy "profiles_admin_all" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());

create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

create policy "profiles_office_admin_select_employees" on public.profiles
  for select using (
    exists (
      select 1 from public.office_users ou_me
      join public.office_users ou_them on ou_me.office_id = ou_them.office_id
      where ou_me.user_id = auth.uid()
        and ou_me.role = 'office_admin'
        and ou_them.user_id = profiles.id
    )
  );

create policy "profiles_restaurant_manager_select_order_customers" on public.profiles
  for select using (
    exists (
      select 1 from public.orders o
      where o.user_id = profiles.id
        and o.restaurant_id in (select public.my_restaurant_ids())
        and o.status = 'paid'
    )
  );

-- restaurants
create policy "restaurants_admin_all" on public.restaurants
  for all using (public.is_admin()) with check (public.is_admin());

create policy "restaurants_manager_select" on public.restaurants
  for select using (id in (select public.my_restaurant_ids()));

create policy "restaurants_employee_select_scheduled" on public.restaurants
  for select using (
    exists (
      select 1 from public.daily_lunch_schedules dls
      where dls.restaurant_id = restaurants.id
        and dls.office_id in (select public.my_office_ids())
        and dls.status in ('open', 'closed', 'sent_to_restaurant', 'delivered')
    )
  );

-- restaurant_users
create policy "restaurant_users_admin_all" on public.restaurant_users
  for all using (public.is_admin()) with check (public.is_admin());

create policy "restaurant_users_manager_select" on public.restaurant_users
  for select using (restaurant_id in (select public.my_restaurant_ids()));

-- offices
create policy "offices_admin_all" on public.offices
  for all using (public.is_admin()) with check (public.is_admin());

create policy "offices_member_select" on public.offices
  for select using (id in (select public.my_office_ids()));

-- office_users
create policy "office_users_admin_all" on public.office_users
  for all using (public.is_admin()) with check (public.is_admin());

create policy "office_users_office_admin_select" on public.office_users
  for select using (public.is_office_admin_for(office_id));

create policy "office_users_member_select_own" on public.office_users
  for select using (user_id = auth.uid());

-- menu_categories
create policy "menu_categories_admin_all" on public.menu_categories
  for all using (public.is_admin()) with check (public.is_admin());

create policy "menu_categories_manager_all" on public.menu_categories
  for all using (public.is_restaurant_manager_for(restaurant_id))
  with check (public.is_restaurant_manager_for(restaurant_id));

create policy "menu_categories_employee_select" on public.menu_categories
  for select using (
    active = true
    and exists (
      select 1 from public.daily_lunch_schedules dls
      where dls.restaurant_id = menu_categories.restaurant_id
        and dls.office_id in (select public.my_office_ids())
        and dls.status = 'open'
        and dls.lunch_date = current_date
    )
  );

-- menu_items
create policy "menu_items_admin_all" on public.menu_items
  for all using (public.is_admin()) with check (public.is_admin());

create policy "menu_items_manager_all" on public.menu_items
  for all using (public.is_restaurant_manager_for(restaurant_id))
  with check (public.is_restaurant_manager_for(restaurant_id));

create policy "menu_items_employee_select" on public.menu_items
  for select using (
    active = true
    and available = true
    and exists (
      select 1 from public.daily_lunch_schedules dls
      where dls.restaurant_id = menu_items.restaurant_id
        and dls.office_id in (select public.my_office_ids())
        and dls.status = 'open'
        and dls.lunch_date = current_date
    )
  );

-- daily_lunch_schedules
create policy "schedules_admin_all" on public.daily_lunch_schedules
  for all using (public.is_admin()) with check (public.is_admin());

create policy "schedules_manager_select" on public.daily_lunch_schedules
  for select using (restaurant_id in (select public.my_restaurant_ids()));

create policy "schedules_office_member_select" on public.daily_lunch_schedules
  for select using (office_id in (select public.my_office_ids()));

create policy "schedules_office_admin_update" on public.daily_lunch_schedules
  for update using (public.is_office_admin_for(office_id))
  with check (public.is_office_admin_for(office_id));

-- orders
create policy "orders_admin_all" on public.orders
  for all using (public.is_admin()) with check (public.is_admin());

create policy "orders_manager_select_paid" on public.orders
  for select using (
    restaurant_id in (select public.my_restaurant_ids())
    and status = 'paid'
  );

create policy "orders_office_admin_select" on public.orders
  for select using (public.is_office_admin_for(office_id));

create policy "orders_employee_select_own" on public.orders
  for select using (user_id = auth.uid());

create policy "orders_employee_insert" on public.orders
  for insert with check (
    user_id = auth.uid()
    and office_id in (select public.my_office_ids())
    and status = 'pending_payment'
    and exists (
      select 1 from public.daily_lunch_schedules dls
      where dls.id = schedule_id
        and dls.office_id = orders.office_id
        and dls.status = 'open'
        and dls.order_cutoff_at > now()
    )
  );

create policy "orders_employee_update_own_pending" on public.orders
  for update using (
    user_id = auth.uid() and status = 'pending_payment'
  ) with check (
    user_id = auth.uid() and status = 'pending_payment'
  );

-- order_items
create policy "order_items_admin_all" on public.order_items
  for all using (public.is_admin()) with check (public.is_admin());

create policy "order_items_via_order_select" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (
          public.is_admin()
          or o.user_id = auth.uid()
          or public.is_office_admin_for(o.office_id)
          or (o.restaurant_id in (select public.my_restaurant_ids()) and o.status = 'paid')
        )
    )
  );

create policy "order_items_employee_insert" on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and o.user_id = auth.uid()
        and o.status = 'pending_payment'
    )
  );

-- platform_settings
create policy "platform_settings_admin_all" on public.platform_settings
  for all using (public.is_admin()) with check (public.is_admin());

create policy "platform_settings_authenticated_select" on public.platform_settings
  for select using (auth.uid() is not null);

-- audit_log
create policy "audit_log_admin_select" on public.audit_log
  for select using (public.is_admin());

create policy "audit_log_admin_insert" on public.audit_log
  for insert with check (public.is_admin());

-- Grant usage
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;
grant execute on all functions in schema public to anon, authenticated;
