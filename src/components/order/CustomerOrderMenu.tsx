"use client";

import { useState } from "react";
import { MenuItemPhoto } from "@/components/order/MenuItemPhoto";
import {
  filterCustomerFacingCategories,
  subcategoriesFor,
  topLevelCategories,
} from "@/lib/menus/category-tree";
import { MenuItemPromoPrice } from "@/components/order/MenuItemPromoPrice";
import {
  buildCartLineKey,
  defaultSizeId,
  menuItemHasOptions,
  orderUnitPriceCents,
} from "@/lib/menus/item-options";
import { sortMenuItems } from "@/lib/menus/sort";
import { formatCents } from "@/lib/money/format";
import { Button, Card } from "@/components/ui";
import type { MenuCategory, MenuItem, MenuItemIngredient, MenuItemSize } from "@/types/database";

function lunchDateForPromos(explicit?: string): string {
  if (explicit) return explicit;
  return new Date().toISOString().slice(0, 10);
}

export type CustomerCartLine = {
  lineKey: string;
  menuItemId: string;
  sizeId: string | null;
  removedIngredientIds: string[];
  quantity: number;
  specialInstructions?: string;
};

function MenuItemOrderRow({
  item,
  lunchDate,
  sizes,
  ingredients,
  interactive,
  simpleLineKey,
  simpleQty,
  onSimpleQtyChange,
  onAddConfigured,
}: {
  item: MenuItem;
  lunchDate: string;
  sizes: MenuItemSize[];
  ingredients: MenuItemIngredient[];
  interactive: boolean;
  simpleLineKey: string;
  simpleQty: number;
  onSimpleQtyChange?: (lineKey: string, nextQty: number) => void;
  onAddConfigured?: (line: Omit<CustomerCartLine, "lineKey" | "quantity">) => void;
}) {
  const hasOptions = menuItemHasOptions(sizes, ingredients);
  const [open, setOpen] = useState(false);
  const [sizeId, setSizeId] = useState<string | null>(() => defaultSizeId(sizes));
  const [removed, setRemoved] = useState<Set<string>>(() => new Set());

  const selectedSize = sizes.find((s) => s.id === sizeId) ?? null;
  const unitPrice = orderUnitPriceCents(item, lunchDate, selectedSize);

  const showSizeRange = sizes.length > 0;
  const sizeRangeLabel = showSizeRange
    ? (() => {
        const prices = sizes.map((s) => s.price_cents);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        if (min === max) return formatCents(min);
        return `${formatCents(min)} – ${formatCents(max)}`;
      })()
    : null;

  function toggleIngredient(id: string) {
    setRemoved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function addConfiguredToCart() {
    if (!onAddConfigured) return;
    if (sizes.length && !sizeId) return;
    const removedIngredientIds = [...removed];
    onAddConfigured({
      menuItemId: item.id,
      sizeId: sizes.length ? sizeId : null,
      removedIngredientIds,
    });
    setOpen(false);
  }

  return (
    <div className="border-b border-slate-100 py-4 last:border-0 last:pb-0">
      <div className="flex items-stretch gap-3 sm:gap-4">
        <MenuItemPhoto imageUrl={item.image_url} itemName={item.name} showPlaceholder />
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <h3 className="font-semibold leading-snug text-slate-900">{item.name}</h3>
          {item.description ? (
            <p className="mt-0.5 line-clamp-2 text-sm text-slate-600">{item.description}</p>
          ) : null}
          {showSizeRange ? (
            <p className="mt-1 text-sm font-medium text-red-600">{sizeRangeLabel}</p>
          ) : (
            <MenuItemPromoPrice item={item} lunchDate={lunchDate} priceCents={unitPrice} />
          )}
          {hasOptions && interactive ? (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="mt-2 w-fit text-left text-xs font-semibold text-[var(--geaux-red)] hover:underline"
            >
              {open ? "Hide customize ▴" : "Customize ▾"}
            </button>
          ) : null}
        </div>
        {interactive && !hasOptions && onSimpleQtyChange ? (
          <div className="flex shrink-0 items-center gap-2 self-center">
            <button
              type="button"
              onClick={() => onSimpleQtyChange(simpleLineKey, simpleQty - 1)}
              className="qty-btn"
              aria-label={`Decrease ${item.name}`}
            >
              −
            </button>
            <span className="w-6 text-center font-bold">{simpleQty}</span>
            <button
              type="button"
              onClick={() => onSimpleQtyChange(simpleLineKey, simpleQty + 1)}
              className="qty-btn"
              aria-label={`Increase ${item.name}`}
            >
              +
            </button>
          </div>
        ) : null}
      </div>

      {hasOptions && interactive && open ? (
        <div className="menu-item-customize-panel mt-3 rounded-xl border border-slate-200 bg-slate-50/90 p-4">
          {sizes.length > 0 ? (
            <fieldset className="mb-4">
              <legend className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                Size
              </legend>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <label
                    key={s.id}
                    className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm transition-colors ${
                      sizeId === s.id
                        ? "border-[var(--geaux-red)] bg-white font-semibold text-[var(--geaux-red)] shadow-sm"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      className="sr-only"
                      name={`size-${item.id}`}
                      checked={sizeId === s.id}
                      onChange={() => setSizeId(s.id)}
                    />
                    {s.name} · {formatCents(s.price_cents)}
                  </label>
                ))}
              </div>
            </fieldset>
          ) : null}

          {ingredients.length > 0 ? (
            <fieldset className="mb-4">
              <legend className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                Ingredients
              </legend>
              <p className="mb-2 text-xs text-slate-500">Tap to leave off anything you don&apos;t want.</p>
              <div className="flex flex-wrap gap-2">
                {ingredients.map((ing) => {
                  const off = removed.has(ing.id);
                  return (
                    <button
                      key={ing.id}
                      type="button"
                      onClick={() => toggleIngredient(ing.id)}
                      className={`rounded-full border px-3 py-1 text-sm transition-all ${
                        off
                          ? "border-slate-300 bg-white text-slate-400 line-through"
                          : "border-green-200 bg-green-50 text-green-900 hover:border-green-300"
                      }`}
                    >
                      {off ? "No " : ""}
                      {ing.name}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-3">
            <p className="text-sm text-slate-600">
              <span className="text-slate-500">Your price:</span>{" "}
              <strong className="text-slate-900">{formatCents(unitPrice)}</strong>
            </p>
            <Button type="button" size="sm" onClick={addConfiguredToCart}>
              Add to cart
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ItemList({
  items,
  promoDate,
  sizesByMenuItemId,
  ingredientsByMenuItemId,
  cart,
  interactive,
  onSimpleQtyChange,
  onAddConfigured,
}: {
  items: MenuItem[];
  promoDate: string;
  sizesByMenuItemId: Record<string, MenuItemSize[]>;
  ingredientsByMenuItemId: Record<string, MenuItemIngredient[]>;
  cart: Record<string, CustomerCartLine>;
  interactive: boolean;
  onSimpleQtyChange?: (lineKey: string, nextQty: number) => void;
  onAddConfigured?: (line: Omit<CustomerCartLine, "lineKey" | "quantity">) => void;
}) {
  if (!items.length) return null;
  return (
    <div className="space-y-0">
      {items.map((item) => {
        const simpleLineKey = buildCartLineKey(item.id, null, []);
        const simpleQty = cart[simpleLineKey]?.quantity ?? 0;
        return (
          <MenuItemOrderRow
            key={item.id}
            item={item}
            lunchDate={promoDate}
            sizes={sizesByMenuItemId[item.id] ?? []}
            ingredients={ingredientsByMenuItemId[item.id] ?? []}
            interactive={interactive}
            simpleLineKey={simpleLineKey}
            simpleQty={simpleQty}
            onSimpleQtyChange={onSimpleQtyChange}
            onAddConfigured={onAddConfigured}
          />
        );
      })}
    </div>
  );
}

export function CustomerOrderMenu({
  categories,
  menuItems,
  lunchDate,
  interactive = true,
  cart = {},
  onSimpleQtyChange,
  onAddConfigured,
  emptyMessage = "No menu items available.",
  sizesByMenuItemId = {},
  ingredientsByMenuItemId = {},
}: {
  categories: MenuCategory[];
  menuItems: MenuItem[];
  lunchDate?: string;
  interactive?: boolean;
  cart?: Record<string, CustomerCartLine>;
  onSimpleQtyChange?: (lineKey: string, nextQty: number) => void;
  onAddConfigured?: (line: Omit<CustomerCartLine, "lineKey" | "quantity">) => void;
  emptyMessage?: string;
  sizesByMenuItemId?: Record<string, MenuItemSize[]>;
  ingredientsByMenuItemId?: Record<string, MenuItemIngredient[]>;
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
    cart,
    interactive,
    onSimpleQtyChange,
    onAddConfigured,
    sizesByMenuItemId,
    ingredientsByMenuItemId,
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
