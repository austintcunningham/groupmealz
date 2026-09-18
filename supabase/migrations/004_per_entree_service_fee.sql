-- Service fee per entrée (quantity of menu items), not per order.

alter table public.platform_settings
  drop constraint if exists platform_settings_platform_fee_type_check;

alter table public.platform_settings
  add constraint platform_settings_platform_fee_type_check
  check (platform_fee_type in ('flat', 'percentage', 'hybrid', 'per_entree'));

update public.platform_settings
set platform_fee_type = 'per_entree'
where platform_fee_type = 'flat';
