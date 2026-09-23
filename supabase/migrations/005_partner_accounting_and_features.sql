-- Reset test orders (no authentic purchases yet)
delete from public.order_items;
delete from public.orders;

-- Entrée-only service fee
alter table public.menu_items
  add column if not exists counts_as_entree boolean not null default true;

-- Customer gratuity + restaurant settlement fields on orders
alter table public.orders
  add column if not exists gratuity_cents int not null default 0,
  add column if not exists restaurant_commission_cents int not null default 0,
  add column if not exists stripe_processing_fee_cents int not null default 0;

-- Platform commission to restaurants (10% of food subtotal)
alter table public.platform_settings
  add column if not exists restaurant_commission_bps int not null default 1000,
  add column if not exists stripe_fee_fixed_cents int not null default 35,
  add column if not exists stripe_fee_bps int not null default 270;

-- Restaurant branding (URLs set by admin/manager; approved by admin)
alter table public.restaurants
  add column if not exists banner_url text,
  add column if not exists branding_status text not null default 'approved'
    check (branding_status in ('pending', 'approved', 'rejected'));

-- Office managers opt in to Restaurant of the Day email
alter table public.office_users
  add column if not exists rotd_email_opt_in boolean not null default false;

-- Admin-built lunch announcements (Restaurant of the Day email)
create table if not exists public.lunch_announcements (
  id uuid primary key default gen_random_uuid(),
  office_id uuid not null references public.offices(id) on delete cascade,
  schedule_id uuid references public.daily_lunch_schedules(id) on delete set null,
  subject text not null,
  headline text,
  body_html text not null,
  send_at timestamptz not null,
  sent_at timestamptz,
  status text not null default 'scheduled'
    check (status in ('draft', 'scheduled', 'sent', 'cancelled')),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger lunch_announcements_updated_at
  before update on public.lunch_announcements
  for each row execute function public.set_updated_at();

alter table public.lunch_announcements enable row level security;

create policy "lunch_announcements_admin_all" on public.lunch_announcements
  for all using (public.is_admin()) with check (public.is_admin());

create policy "lunch_announcements_office_admin_select" on public.lunch_announcements
  for select using (
    office_id in (
      select ou.office_id from public.office_users ou
      where ou.user_id = auth.uid() and ou.role = 'office_admin'
    )
  );

-- Weekly settlement snapshots (optional cache; reports also compute live)
create table if not exists public.restaurant_weekly_settlements (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  week_start date not null,
  week_end date not null,
  order_count int not null default 0,
  subtotal_cents int not null default 0,
  tax_cents int not null default 0,
  gratuity_cents int not null default 0,
  gross_sales_cents int not null default 0,
  commission_cents int not null default 0,
  stripe_fee_cents int not null default 0,
  check_total_cents int not null default 0,
  created_at timestamptz not null default now(),
  unique (restaurant_id, week_start)
);

alter table public.restaurant_weekly_settlements enable row level security;

create policy "restaurant_weekly_settlements_admin_all" on public.restaurant_weekly_settlements
  for all using (public.is_admin()) with check (public.is_admin());

create policy "restaurant_weekly_settlements_manager_select" on public.restaurant_weekly_settlements
  for select using (public.is_restaurant_manager_for(restaurant_id));
