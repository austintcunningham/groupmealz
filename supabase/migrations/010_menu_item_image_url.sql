alter table public.menu_items
  add column if not exists image_url text;

comment on column public.menu_items.image_url is 'Public HTTPS URL for item photo on order pages';
