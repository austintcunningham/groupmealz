-- One-level sub-categories under a top-level menu category.

alter table public.menu_categories
  add column if not exists parent_id uuid references public.menu_categories(id) on delete cascade;

create index if not exists menu_categories_parent_order
  on public.menu_categories (restaurant_id, parent_id, display_order);

-- Normalize display_order within each sibling group (top-level vs per parent).
with numbered as (
  select
    id,
    row_number() over (
      partition by restaurant_id, coalesce(parent_id::text, '')
      order by display_order, name, created_at
    ) - 1 as rn
  from public.menu_categories
)
update public.menu_categories c
set display_order = n.rn
from numbered n
where c.id = n.id;
