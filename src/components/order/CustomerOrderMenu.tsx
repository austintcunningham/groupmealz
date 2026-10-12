"use client";

import { MenuItemPhoto } from "@/components/order/MenuItemPhoto";
import {
  filterCustomerFacingCategories,
  subcategoriesFor,
  topLevelCategories,
} from "@/lib/menus/category-tree";
import { effectivePriceCents, isPromoActive } from "@/lib/menus/effective-price";
import { sortMenuItems } from "@/lib/menus/sort";
import { formatCents } from "@/lib/money/format";
import { Card } from "@/components/ui";
import type { MenuCategory, MenuItem } from "@/types/database";

function lunchDateForPromos(explicit?: string): string {
  if (explicit) return explicit;
  return new Date().toISOString().slice(0, 10);
}

function MenuItemRow({
  item,
  lunchDate,
  quantity,
  onQuantityChange,
  interactive,
}: {
  item: MenuItem;
  lunchDate: string;
  quantity?: number;
  onQuantityChange?: (menuItemId: string, nextQty: number) => void;
  interactive: boolean;
}) {
  const promo = isPromoActive(item, lunchDate);
  const price = effectivePriceCents(item, lunchDate);
  const qty = quantity ?? 0;

  return (
    <div className="flex items-stretch gap-3 border-b border-slate-100 py-3 last:border-0 last:pb-0 sm:gap-4">
      <MenuItemPhoto imageUrl={item.image_url} itemName={item.name} showPlaceholder />
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <h3 className="font-semibold leading-snug text-slate-900">{item.name}</h3>
        {item.description ? (
          <p className="mt-0.5 line-clamp-2 text-sm text-slate-600">{item.description}</p>
        ) : null}
        {promo ? (
          <p className="mt-1 text-sm text-slate-600">
            <span className="line-through">{formatCents(item.price_cents)}</span>{" "}
            <span className="font-medium text-red-600">{formatCents(price)}</span>
            {item.promo_label ? (
              <span className="ml-1 text-xs text-green-700">{item.promo_label}</span>
            ) : null}
          </p>
        ) : (
          <p className="mt-1 font-medium text-red-600">{formatCents(item.price_cents)}</p>
        )}
      </div>
      {interactive && onQuantityChange ? (
        <div className="flex shrink-0 items-center gap-2 self-center">
          <button
            type="button"
            onClick={() => onQuantityChange(item.id, qty - 1)}
            className="qty-btn"
            aria-label={`Decrease ${item.name}`}
          >
            −
          </button>
          <span className="w-6 text-center font-bold">{qty}</span>
          <button
            type="button"
            onClick={() => onQuantityChange(item.id, qty + 1)}
            className="qty-btn"
            aria-label={`Increase ${item.name}`}
          >
            +
          </button>
        </div>
      ) : null}
    </div>
  );
}

function ItemList({
  items,
  promoDate,
  quantities,
  onQuantityChange,
  interactive,
}: {
  items: MenuItem[];
  promoDate: string;
  quantities?: Record<string, number>;
  onQuantityChange?: (menuItemId: string, nextQty: number) => void;
  interactive: boolean;
}) {
  if (!items.length) return null;
  return (
    <div className="space-y-0">
      {items.map((item) => (
        <MenuItemRow
          key={item.id}
          item={item}
          lunchDate={promoDate}
          quantity={quantities?.[item.id] ?? 0}
          onQuantityChange={onQuantityChange}
          interactive={interactive}
        />
      ))}
    </div>
  );
}

export function CustomerOrderMenu({
  categories,
  menuItems,
  lunchDate,
  interactive = true,
  quantities,
  onQuantityChange,
  emptyMessage = "No menu items available.",
}: {
  categories: MenuCategory[];
  menuItems: MenuItem[];
  lunchDate?: string;
  interactive?: boolean;
  quantities?: Record<string, number>;
  onQuantityChange?: (menuItemId: string, nextQty: number) => void;
  emptyMessage?: string;
}) {
  const promoDate = lunchDateForPromos(lunchDate);

  const itemsByCategory = new Map<string, MenuItem[]>();
  for (const item of sortMenuItems(menuItems)) {
    const catId = item.category_id ?? "uncategorized";
    const list = itemsByCategory.get(catId) ?? [];
    list.push(item);
    itemsByCategory.set(catId, list);
  }

  if (menuItems.length === 0) {
    return <p className="text-sm text-slate-500">{emptyMessage}</p>;
  }

  const tops = topLevelCategories(categories);
  const orphanSubs = categories.filter(
    (c) => c.parent_id && !categories.some((p) => p.id === c.parent_id)
  );

  const listProps = {
    promoDate,
    quantities,
    onQuantityChange,
    interactive,
  };

  return (
    <div className="space-y-6">
      {tops.map((top) => {
        const subs = subcategoriesFor(categories, top.id);
        const topItems = itemsByCategory.get(top.id) ?? [];
        const subBlocks = subs
          .map((sub) => ({
            sub,
            items: itemsByCategory.get(sub.id) ?? [],
          }))
          .filter((b) => b.items.length > 0);

        if (!topItems.length && !subBlocks.length) return null;

        return (
          <Card key={top.id} title={top.name}>
            <div className="space-y-5">
              {subBlocks.map(({ sub, items }) => (
                <div key={sub.id}>
                  <h3 className="mb-2 border-b border-slate-100 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {sub.name}
                  </h3>
                  <ItemList items={items} {...listProps} />
                </div>
              ))}
              {topItems.length > 0 ? (
                <div className={subBlocks.length ? "border-t border-slate-100 pt-3" : undefined}>
                  {subBlocks.length > 0 ? (
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Other
                    </h3>
                  ) : null}
                  <ItemList items={topItems} {...listProps} />
                </div>
              ) : null}
            </div>
          </Card>
        );
      })}

      {orphanSubs.map((sub) => {
        const items = itemsByCategory.get(sub.id) ?? [];
        if (!items.length) return null;
        return (
          <Card key={sub.id} title={sub.name}>
            <ItemList items={items} {...listProps} />
          </Card>
        );
      })}

      {(itemsByCategory.get("uncategorized") ?? []).length > 0 ? (
        <Card title="Menu">
          <ItemList items={itemsByCategory.get("uncategorized") ?? []} {...listProps} />
        </Card>
      ) : null}
    </div>
  );
}

/** Items/categories as customers see them on order pages (available + active only). */
export function filterCustomerFacingMenu(
  categories: MenuCategory[],
  menuItems: MenuItem[]
): { categories: MenuCategory[]; menuItems: MenuItem[] } {
  const visibleItems = menuItems.filter((i) => i.active && i.available);
  const visibleCategories = filterCustomerFacingCategories(categories, visibleItems);
  return { categories: visibleCategories, menuItems: visibleItems };
}
