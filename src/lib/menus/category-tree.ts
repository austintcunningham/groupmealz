import { sortMenuCategories } from "@/lib/menus/sort";
import type { MenuCategory, MenuItem } from "@/types/database";

export function topLevelCategories(categories: MenuCategory[]): MenuCategory[] {
  return sortMenuCategories(categories.filter((c) => !c.parent_id));
}

export function subcategoriesFor(
  categories: MenuCategory[],
  parentId: string
): MenuCategory[] {
  return sortMenuCategories(categories.filter((c) => c.parent_id === parentId));
}

/** Flat list for item assignment dropdowns (top + indented sub). */
export function categorySelectOptions(
  categories: MenuCategory[]
): { id: string; label: string }[] {
  const options: { id: string; label: string }[] = [];
  for (const top of topLevelCategories(categories)) {
    options.push({ id: top.id, label: top.name });
    for (const sub of subcategoriesFor(categories, top.id)) {
      options.push({ id: sub.id, label: `${top.name} › ${sub.name}` });
    }
  }
  return options;
}

export function siblingCategories(
  categories: MenuCategory[],
  category: MenuCategory
): MenuCategory[] {
  const parentKey = category.parent_id ?? null;
  return sortMenuCategories(
    categories.filter((c) => (c.parent_id ?? null) === parentKey)
  );
}

/** Categories + parents needed for customer menu when items exist. */
/** Categories needed for menu editor preview (includes sold-out items). */
export function filterEditorMenuCategories(
  categories: MenuCategory[],
  menuItems: MenuItem[]
): MenuCategory[] {
  const activeItems = menuItems.filter((i) => i.active);
  const needed = new Set<string>();

  for (const item of activeItems) {
    if (item.category_id) needed.add(item.category_id);
  }

  for (const cat of categories) {
    if (needed.has(cat.id) && cat.parent_id) {
      needed.add(cat.parent_id);
    }
  }

  return categories.filter((c) => c.active && needed.has(c.id));
}

export function filterCustomerFacingCategories(
  categories: MenuCategory[],
  menuItems: MenuItem[]
): MenuCategory[] {
  const visibleItems = menuItems.filter((i) => i.active && i.available);
  const needed = new Set<string>();

  for (const item of visibleItems) {
    if (item.category_id) needed.add(item.category_id);
  }

  for (const cat of categories) {
    if (needed.has(cat.id) && cat.parent_id) {
      needed.add(cat.parent_id);
    }
  }

  return categories.filter((c) => c.active && needed.has(c.id));
}

export function itemsForCategory(
  menuItems: MenuItem[],
  categoryId: string
): MenuItem[] {
  return menuItems.filter((i) => i.category_id === categoryId);
}
