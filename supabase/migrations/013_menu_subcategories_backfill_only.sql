-- Run this ONLY if 013_menu_subcategories.sql failed on the backfill step
-- but parent_id + index were already added.

with numbered as (
  select
    id,
    row_number() over (
      partition by restaurant_id, coalesce(parent_id::text, '')
      order by display_order, name, id
    ) - 1 as rn
  from public.menu_categories
)
update public.menu_categories c
set display_order = n.rn
from numbered n
where c.id = n.id;
