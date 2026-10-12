-- Optional note from customer to restaurant (whole order, not per line item)
alter table public.orders
  add column if not exists customer_note text;

comment on column public.orders.customer_note is 'Free-text note from customer for the restaurant kitchen';
