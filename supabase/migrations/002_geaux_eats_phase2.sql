-- Geaux Eats — phase 2: weekly templates, ordering windows, Stripe customers, saved cards

-- Profiles: Stripe customer for saved cards
alter table public.profiles
  add column if not exists stripe_customer_id text;

-- Schedules: when ordering opens (48h before lunch by default)
alter table public.daily_lunch_schedules
  add column if not exists order_opens_at timestamptz;

-- Backfill order_opens_at for existing rows (48h before cutoff)
update public.daily_lunch_schedules
set order_opens_at = order_cutoff_at - interval '48 hours'
where order_opens_at is null;

alter table public.daily_lunch_schedules
  alter column order_opens_at set not null;

-- Platform: configurable advance ordering window
alter table public.platform_settings
  add column if not exists advance_order_hours int not null default 48;

-- Orders: support authorize-then-capture flow
alter table public.orders
  drop constraint if exists orders_status_check;

alter table public.orders
  add constraint orders_status_check
  check (status in ('pending_payment', 'authorized', 'paid', 'cancelled', 'failed'));

-- Weekly schedule templates (office + day of week → restaurant)
create table if not exists public.weekly_schedule_templates (
  id uuid primary key default gen_random_uuid(),
  office_id uuid not null references public.offices(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  cutoff_time time not null default '11:00:00',
  delivery_time time not null default '12:00:00',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (office_id, day_of_week)
);

create trigger weekly_schedule_templates_updated_at
  before update on public.weekly_schedule_templates
  for each row execute function public.set_updated_at();

-- Saved payment methods (Stripe references only — never card numbers)
create table if not exists public.saved_payment_methods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  stripe_payment_method_id text not null,
  card_brand text,
  card_last4 text,
  exp_month int,
  exp_year int,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, stripe_payment_method_id)
);

-- RLS
alter table public.weekly_schedule_templates enable row level security;
alter table public.saved_payment_methods enable row level security;

create policy "weekly_templates_admin_all" on public.weekly_schedule_templates
  for all using (public.is_admin()) with check (public.is_admin());

create policy "weekly_templates_office_select" on public.weekly_schedule_templates
  for select using (office_id in (select public.my_office_ids()));

create policy "saved_pm_admin_all" on public.saved_payment_methods
  for all using (public.is_admin()) with check (public.is_admin());

create policy "saved_pm_own_select" on public.saved_payment_methods
  for select using (user_id = auth.uid());

create policy "saved_pm_own_insert" on public.saved_payment_methods
  for insert with check (user_id = auth.uid());

create policy "saved_pm_own_delete" on public.saved_payment_methods
  for delete using (user_id = auth.uid());

-- Update employee schedule visibility to respect order_opens_at
drop policy if exists "menu_items_employee_select" on public.menu_items;
create policy "menu_items_employee_select" on public.menu_items
  for select using (
    active = true
    and available = true
    and exists (
      select 1 from public.daily_lunch_schedules dls
      where dls.restaurant_id = menu_items.restaurant_id
        and dls.office_id in (select public.my_office_ids())
        and dls.status = 'open'
        and dls.order_opens_at <= now()
        and dls.order_cutoff_at > now()
    )
  );

drop policy if exists "menu_categories_employee_select" on public.menu_categories;
create policy "menu_categories_employee_select" on public.menu_categories
  for select using (
    active = true
    and exists (
      select 1 from public.daily_lunch_schedules dls
      where dls.restaurant_id = menu_categories.restaurant_id
        and dls.office_id in (select public.my_office_ids())
        and dls.status = 'open'
        and dls.order_opens_at <= now()
        and dls.order_cutoff_at > now()
    )
  );

drop policy if exists "orders_employee_insert" on public.orders;
create policy "orders_employee_insert" on public.orders
  for insert with check (
    user_id = auth.uid()
    and office_id in (select public.my_office_ids())
    and status in ('pending_payment', 'authorized')
    and exists (
      select 1 from public.daily_lunch_schedules dls
      where dls.id = schedule_id
        and dls.office_id = orders.office_id
        and dls.status = 'open'
        and dls.order_opens_at <= now()
        and dls.order_cutoff_at > now()
    )
  );

grant all on public.weekly_schedule_templates to anon, authenticated;
grant all on public.saved_payment_methods to anon, authenticated;
