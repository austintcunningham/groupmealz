-- Temporary deals / promo pricing on menu items (restaurant-managed).

alter table public.menu_items
  add column if not exists promo_label text,
  add column if not exists promo_price_cents int check (promo_price_cents is null or promo_price_cents >= 0),
  add column if not exists promo_ends_at date;
