-- Idempotency for Monday weekly digest emails (restaurant payout, office summary, ops rollup).
create table if not exists public.weekly_digest_runs (
  week_start date not null,
  completed_at timestamptz not null default now(),
  primary key (week_start)
);

comment on table public.weekly_digest_runs is
  'Tracks weekly digest send for work week starting Monday (Central); emails Fri 4 PM Mon–Fri orders.';

alter table public.weekly_digest_runs enable row level security;

create policy "weekly_digest_runs_admin_all" on public.weekly_digest_runs
  for all using (public.is_admin()) with check (public.is_admin());
