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

/** Reorder after drag-drop within one list (activeId moves to overId's index). */
export function reorderIdsInList(ids: string[], activeId: string, overId: string): string[] | null {
  const oldIndex = ids.indexOf(activeId);
  const newIndex = ids.indexOf(overId);
  if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return null;
  const next = [...ids];
  next.splice(oldIndex, 1);
  next.splice(newIndex, 0, activeId);
  return next;
}

/**
 * Apply a new order for visible rows while keeping hidden siblings (e.g. sold-out) in place.
 */
export function mergeVisibleReorder(
  siblings: MenuCategory[] | MenuItem[],
  visibleIds: string[],
  newVisibleOrder: string[]
): string[] {
  const sorted = [...siblings].sort(
    (a, b) => a.display_order - b.display_order || a.name.localeCompare(b.name)
  );
  const visibleSet = new Set(visibleIds);
  if (newVisibleOrder.join() === sorted.filter((s) => visibleSet.has(s.id)).map((s) => s.id).join()) {
    return sorted.map((s) => s.id);
  }
  let vi = 0;
  return sorted.map((row) => {
    if (!visibleSet.has(row.id)) return row.id;
    return newVisibleOrder[vi++] ?? row.id;
  });
}
