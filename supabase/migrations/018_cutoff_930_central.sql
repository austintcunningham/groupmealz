-- Default order cutoff 9:30 AM Central (stored as time; app converts with America/Chicago).
alter table public.weekly_schedule_templates
  alter column cutoff_time set default '09:30:00';

update public.weekly_schedule_templates
set cutoff_time = '09:30:00'
where cutoff_time = '11:00:00';
