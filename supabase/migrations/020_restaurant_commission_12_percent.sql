-- Group Meals restaurant partner commission: 12% of food subtotal (pre-tax), before payout.

alter table public.platform_settings
  alter column restaurant_commission_bps set default 1200;

update public.platform_settings
set restaurant_commission_bps = 1200
where restaurant_commission_bps = 1000;
