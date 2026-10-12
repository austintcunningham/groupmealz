"use client";

import Image from "next/image";
import { effectivePriceCents, isPromoActive } from "@/lib/menus/effective-price";
import { formatCents } from "@/lib/money/format";
import { Card } from "@/components/ui";
import { sortMenuCategories, sortMenuItems } from "@/lib/menus/sort";
import type { MenuCategory, MenuItem } from "@/types/database";

function lunchDateForPromos(explicit?: string): string {
  if (explicit) return explicit;
  return new Date().toISOString().slice(0, 10);
}

function MenuItemRow({
  item,
  lunchDate,
  serviceFeePerEntree,
  quantity,
  onQuantityChange,
  interactive,
}: {
  item: MenuItem;
  lunchDate: string;
  serviceFeePerEntree: number | null;
  quantity?: number;
  onQuantityChange?: (menuItemId: string, nextQty: number) => void;
  interactive: boolean;
}) {
  const promo = isPromoActive(item, lunchDate);
  const price = effectivePriceCents(item, lunchDate);
  const qty = quantity ?? 0;

  return (
    <div className="flex gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
      {item.image_url ? (
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
          <Image
            src={item.image_url}
            alt=""
            fill
            className="object-cover"
            sizes="80px"
            unoptimized
          />
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-slate-900">{item.name}</h3>
        {item.description ? (
          <p className="mt-0.5 text-sm text-slate-600">{item.description}</p>
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
        {serviceFeePerEntree != null && (item.counts_as_entree ?? true) ? (
          <p className="text-xs text-slate-500">
            + {formatCents(serviceFeePerEntree)} service fee per entrée
          </p>
        ) : null}
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

export function CustomerOrderMenu({
  categories,
  menuItems,
  lunchDate,
  serviceFeePerEntree = null,
  interactive = true,
  quantities,
  onQuantityChange,
  emptyMessage = "No menu items available.",
}: {
  categories: MenuCategory[];
  menuItems: MenuItem[];
  lunchDate?: string;
  serviceFeePerEntree?: number | null;
  interactive?: boolean;
  quantities?: Record<string, number>;
  onQuantityChange?: (menuItemId: string, nextQty: number) => void;
  emptyMessage?: string;
}) {
  const promoDate = lunchDateForPromos(lunchDate);

  const sortedCategories = sortMenuCategories(categories);

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

  return (
    <div className="space-y-6">
      {sortedCategories.map((cat) => {
        const items = itemsByCategory.get(cat.id) ?? [];
        if (!items.length) return null;
        return (
          <Card key={cat.id} title={cat.name}>
            <div className="space-y-4">
              {items.map((item) => (
                <MenuItemRow
                  key={item.id}
                  item={item}
                  lunchDate={promoDate}
                  serviceFeePerEntree={serviceFeePerEntree}
                  quantity={quantities?.[item.id] ?? 0}
                  onQuantityChange={onQuantityChange}
                  interactive={interactive}
                />
              ))}
            </div>
          </Card>
        );
      })}
      {(itemsByCategory.get("uncategorized") ?? []).length > 0 ? (
        <Card title="Menu">
          <div className="space-y-4">
            {(itemsByCategory.get("uncategorized") ?? []).map((item) => (
              <MenuItemRow
                key={item.id}
                item={item}
                lunchDate={promoDate}
                serviceFeePerEntree={serviceFeePerEntree}
                quantity={quantities?.[item.id] ?? 0}
                onQuantityChange={onQuantityChange}
                interactive={interactive}
              />
            ))}
          </div>
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
  const categoryIds = new Set(
    visibleItems.map((i) => i.category_id).filter(Boolean) as string[]
  );
  const visibleCategories = categories.filter(
    (c) => c.active && (categoryIds.has(c.id) || visibleItems.some((i) => i.category_id === c.id))
  );
  return { categories: visibleCategories, menuItems: visibleItems };
}
