import { effectivePriceCents } from "@/lib/menus/effective-price";
import type { MenuItem, MenuItemIngredient, MenuItemSize } from "@/types/database";

export function groupSizesByMenuItem(
  sizes: MenuItemSize[]
): Record<string, MenuItemSize[]> {
  const map: Record<string, MenuItemSize[]> = {};
  for (const row of sizes) {
    const list = map[row.menu_item_id] ?? [];
    list.push(row);
    map[row.menu_item_id] = list;
  }
  for (const id of Object.keys(map)) {
    map[id]!.sort((a, b) => a.display_order - b.display_order || a.name.localeCompare(b.name));
  }
  return map;
}

export function groupIngredientsByMenuItem(
  ingredients: MenuItemIngredient[]
): Record<string, MenuItemIngredient[]> {
  const map: Record<string, MenuItemIngredient[]> = {};
  for (const row of ingredients) {
    const list = map[row.menu_item_id] ?? [];
    list.push(row);
    map[row.menu_item_id] = list;
  }
  for (const id of Object.keys(map)) {
    map[id]!.sort((a, b) => a.display_order - b.display_order || a.name.localeCompare(b.name));
  }
  return map;
}

export function menuItemHasOptions(
  sizes: MenuItemSize[] | undefined,
  ingredients: MenuItemIngredient[] | undefined
): boolean {
  return (sizes?.length ?? 0) > 0 || (ingredients?.length ?? 0) > 0;
}

export function defaultSizeId(sizes: MenuItemSize[] | undefined): string | null {
  if (!sizes?.length) return null;
  return sizes.find((s) => s.is_default)?.id ?? sizes[0]!.id;
}

/** Unit price for cart/checkout (size overrides base; promo applies only when no sizes). */
export function orderUnitPriceCents(
  item: MenuItem,
  lunchDate: string | undefined,
  size: MenuItemSize | null
): number {
  if (size) return size.price_cents;
  return effectivePriceCents(item, lunchDate);
}

export function formatPriceRangeCents(
  item: MenuItem,
  lunchDate: string | undefined,
  sizes: MenuItemSize[] | undefined
): string {
  if (!sizes?.length) {
    return "";
  }
  const prices = sizes.map((s) => s.price_cents);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (min === max) return "";
  return "from";
}

export function buildCartLineKey(
  menuItemId: string,
  sizeId: string | null,
  removedIngredientIds: string[]
): string {
  const removed = [...removedIngredientIds].sort().join(",");
  return `${menuItemId}:${sizeId ?? "_"}:${removed}`;
}

export function formatRemovedIngredients(names: string[]): string | null {
  if (!names.length) return null;
  return `No: ${names.join(", ")}`;
}

export function buildItemNameSnapshot(itemName: string, sizeLabel: string | null): string {
  return sizeLabel ? `${itemName} (${sizeLabel})` : itemName;
}
