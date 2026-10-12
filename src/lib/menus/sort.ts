import type { MenuCategory, MenuItem } from "@/types/database";

export function sortMenuCategories(categories: MenuCategory[]): MenuCategory[] {
  return [...categories].sort(
    (a, b) => a.display_order - b.display_order || a.name.localeCompare(b.name)
  );
}

export function sortMenuItems(items: MenuItem[]): MenuItem[] {
  return [...items].sort(
    (a, b) => a.display_order - b.display_order || a.name.localeCompare(b.name)
  );
}

export function moveIdInList(ids: string[], id: string, direction: "up" | "down"): string[] {
  const index = ids.indexOf(id);
  if (index === -1) return ids;
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= ids.length) return ids;
  const next = [...ids];
  [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  return next;
}
