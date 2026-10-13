-- Track 9:30 AM daily fulfillment digest (restaurant, office admin, platform admin).
alter table public.daily_lunch_schedules
  add column if not exists fulfillment_digest_sent_at timestamptz;

comment on column public.daily_lunch_schedules.fulfillment_digest_sent_at is
  'When daily 9:30 fulfillment emails were sent for this lunch date (restaurant, office, ops).';
