-- Normalize display_order so drag/up-down reordering and customer menus sort consistently.

with numbered as (
  select
    id,
    row_number() over (
      partition by restaurant_id
      order by display_order, name, id
    ) - 1 as rn
  from public.menu_categories
)
update public.menu_categories c
set display_order = n.rn
from numbered n
where c.id = n.id;

with numbered as (
  select
    id,
    row_number() over (
      partition by restaurant_id, coalesce(category_id::text, '')
      order by display_order, name, created_at
    ) - 1 as rn
  from public.menu_items
)
update public.menu_items m
set display_order = n.rn
from numbered n
where m.id = n.id;
