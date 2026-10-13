"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  MenuCategoryJumpNav,
  menuSectionDomId,
} from "@/components/order/MenuCategoryJumpNav";
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

export function CustomerMenuItemDisplay({
  item,
  lunchDate,
  sizes,
  ingredients,
  interactive,
  showItemOptions = interactive,
  cart,
  simpleLineKey,
  simpleQty,
  onSimpleQtyChange,
  onAddConfigured,
  onEdit,
}: {
  item: MenuItem;
  lunchDate: string;
  sizes: MenuItemSize[];
  ingredients: MenuItemIngredient[];
  interactive: boolean;
  /** When false, still show size/ingredient UI (for admin previews). Defaults to interactive. */
  showItemOptions?: boolean;
  cart: Record<string, CustomerCartLine>;
  simpleLineKey: string;
  simpleQty: number;
  onSimpleQtyChange?: (lineKey: string, nextQty: number) => void;
  onAddConfigured?: (line: Omit<CustomerCartLine, "lineKey" | "quantity">) => void;
  /** Menu editor: edit control shown beside the item name (always visible). */
  onEdit?: () => void;
}) {
  const hasOptions = menuItemHasOptions(sizes, ingredients);
  const [sizeId, setSizeId] = useState<string | null>(() => defaultSizeId(sizes));
  const [removed, setRemoved] = useState<Set<string>>(() => new Set());

  const selectedSize = sizes.find((s) => s.id === sizeId) ?? null;
  const unitPrice = orderUnitPriceCents(item, lunchDate, selectedSize);
  const removedIngredientIds = [...removed];
  const configuredLineKey = buildCartLineKey(
    item.id,
    sizes.length ? sizeId : null,
    removedIngredientIds
  );
  const configuredQty = cart[configuredLineKey]?.quantity ?? 0;

  function toggleIngredient(id: string) {
    setRemoved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function changeConfiguredQty(delta: number) {
    if (!onSimpleQtyChange || !onAddConfigured) return;
    if (sizes.length && !sizeId) return;
    const current = cart[configuredLineKey]?.quantity ?? 0;
    const next = current + delta;
    if (next <= 0) {
      onSimpleQtyChange(configuredLineKey, 0);
      return;
    }
    if (current === 0) {
      onAddConfigured({
        menuItemId: item.id,
        sizeId: sizes.length ? sizeId : null,
        removedIngredientIds,
      });
      return;
    }
    onSimpleQtyChange(configuredLineKey, next);
  }

  const qtyControls = (qty: number, onDecrease: () => void, onIncrease: () => void) => (
    <div className="flex shrink-0 items-center gap-2 self-center">
      <button
        type="button"
        onClick={onDecrease}
        className="qty-btn"
        aria-label={`Decrease ${item.name}`}
      >
        −
      </button>
      <span className="w-6 text-center font-bold">{qty}</span>
      <button
        type="button"
        onClick={onIncrease}
        className="qty-btn"
        aria-label={`Increase ${item.name}`}
      >
        +
      </button>
    </div>
  );

  return (
    <div className="border-b border-slate-100 py-4 last:border-0 last:pb-0">
      <div className="flex items-start gap-3 sm:gap-4">
        <MenuItemPhoto imageUrl={item.image_url} itemName={item.name} size="lg" showPlaceholder />
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold leading-snug text-slate-900">{item.name}</h3>
            {onEdit ? (
              <Button type="button" variant="secondary" size="sm" className="shrink-0" onClick={onEdit}>
                Edit
              </Button>
            ) : null}
          </div>
          {item.description ? (
            <p className="mt-0.5 line-clamp-2 text-sm text-slate-600">{item.description}</p>
          ) : null}
          {!hasOptions ? (
            <MenuItemPromoPrice item={item} lunchDate={lunchDate} priceCents={unitPrice} />
          ) : null}
        </div>
        {interactive && !hasOptions && onSimpleQtyChange
          ? qtyControls(simpleQty, () => onSimpleQtyChange(simpleLineKey, simpleQty - 1), () =>
              onSimpleQtyChange(simpleLineKey, simpleQty + 1)
            )
          : null}
      </div>

      {hasOptions && showItemOptions ? (
        <div className="menu-item-customize-panel mt-3 rounded-xl border border-slate-200 bg-slate-50/90 p-4">
          {sizes.length > 0 ? (
            <fieldset className="mb-4">
              <legend className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                Choose a size
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
          ) : (
            <div className="mb-4">
              <MenuItemPromoPrice item={item} lunchDate={lunchDate} priceCents={unitPrice} />
            </div>
          )}

          {ingredients.length > 0 ? (
            <fieldset className="mb-4">
              <legend className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                Ingredients on your order
              </legend>
              <p className="mb-2 text-xs leading-relaxed text-slate-600">
                <span className="font-semibold text-slate-700">All included by default.</span> Tap an
                ingredient to <span className="font-semibold text-slate-700">leave it off</span> — selected
                items show as removed.
              </p>
              <div className="flex flex-wrap gap-2">
                {ingredients.map((ing) => {
                  const off = removed.has(ing.id);
                  return (
                    <button
                      key={ing.id}
                      type="button"
                      aria-pressed={off}
                      onClick={() => toggleIngredient(ing.id)}
                      className={`rounded-full border px-3 py-1.5 text-sm transition-all ${
                        off
                          ? "border-amber-300 bg-amber-50 text-amber-950 line-through decoration-amber-700/80"
                          : "border-emerald-200 bg-emerald-50/90 text-emerald-950 hover:border-emerald-300"
                      }`}
                    >
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
            {onSimpleQtyChange && onAddConfigured
              ? qtyControls(
                  configuredQty,
                  () => changeConfiguredQty(-1),
                  () => changeConfiguredQty(1)
                )
              : null}
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
  showItemOptions,
  onSimpleQtyChange,
  onAddConfigured,
}: {
  items: MenuItem[];
  promoDate: string;
  sizesByMenuItemId: Record<string, MenuItemSize[]>;
  ingredientsByMenuItemId: Record<string, MenuItemIngredient[]>;
  cart: Record<string, CustomerCartLine>;
  interactive: boolean;
  showItemOptions: boolean;
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
          <CustomerMenuItemDisplay
            key={item.id}
            item={item}
            lunchDate={promoDate}
            sizes={sizesByMenuItemId[item.id] ?? []}
            ingredients={ingredientsByMenuItemId[item.id] ?? []}
            interactive={interactive}
            showItemOptions={showItemOptions}
            cart={cart}
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
  showItemOptions,
  toolbarAction,
}: {
  categories: MenuCategory[];
  menuItems: MenuItem[];
  lunchDate?: string;
  interactive?: boolean;
  /** Show sizes/ingredients when interactive is false (menu previews). */
  showItemOptions?: boolean;
  cart?: Record<string, CustomerCartLine>;
  onSimpleQtyChange?: (lineKey: string, nextQty: number) => void;
  onAddConfigured?: (line: Omit<CustomerCartLine, "lineKey" | "quantity">) => void;
  emptyMessage?: string;
  sizesByMenuItemId?: Record<string, MenuItemSize[]>;
  ingredientsByMenuItemId?: Record<string, MenuItemIngredient[]>;
  /** e.g. mobile cart button — shown beside search (hidden on xl where sidebar cart exists). */
  toolbarAction?: ReactNode;
}) {
  const promoDate = lunchDateForPromos(lunchDate);
  const [searchQuery, setSearchQuery] = useState("");

  const itemsByCategory = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    for (const item of sortMenuItems(menuItems)) {
      const catId = item.category_id ?? "uncategorized";
      const list = map.get(catId) ?? [];
      list.push(item);
      map.set(catId, list);
    }
    return map;
  }, [menuItems]);

  const tops = useMemo(() => topLevelCategories(categories), [categories]);
  const orphanSubs = useMemo(
    () =>
      categories.filter(
        (c) => c.parent_id && !categories.some((p) => p.id === c.parent_id)
      ),
    [categories]
  );

  const resolvedShowOptions = showItemOptions ?? interactive;

  const jumpSections = useMemo(() => {
    const sections: { id: string; label: string }[] = [];
    for (const top of tops) {
      const subs = subcategoriesFor(categories, top.id);
      const topItems = itemsByCategory.get(top.id) ?? [];
      const hasSubs = subs.some((sub) => (itemsByCategory.get(sub.id) ?? []).length > 0);
      if (topItems.length || hasSubs) {
        sections.push({ id: menuSectionDomId(top.id), label: top.name });
      }
    }
    for (const sub of orphanSubs) {
      if ((itemsByCategory.get(sub.id) ?? []).length) {
        sections.push({ id: menuSectionDomId(sub.id), label: sub.name });
      }
    }
    if ((itemsByCategory.get("uncategorized") ?? []).length) {
      sections.push({ id: menuSectionDomId("uncategorized"), label: "Menu" });
    }
    return sections;
  }, [tops, orphanSubs, itemsByCategory, categories]);

  const searchTrim = searchQuery.trim().toLowerCase();
  const searchResults = useMemo(() => {
    if (!searchTrim) return [];
    return sortMenuItems(menuItems).filter((item) => {
      const hay = `${item.name} ${item.description ?? ""}`.toLowerCase();
      return hay.includes(searchTrim);
    });
  }, [menuItems, searchTrim]);

  if (menuItems.length === 0) {
    return <p className="text-sm text-slate-500">{emptyMessage}</p>;
  }

  const listProps = {
    promoDate,
    cart,
    interactive,
    showItemOptions: resolvedShowOptions,
    onSimpleQtyChange,
    onAddConfigured,
    sizesByMenuItemId,
    ingredientsByMenuItemId,
  };

  const sectionScrollMt = "scroll-mt-[8.5rem]";

  return (
    <div className="space-y-6">
      <MenuCategoryJumpNav
        sections={jumpSections}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        hideWhenSearching={searchTrim.length > 0}
        trailingAction={toolbarAction}
      />

      {searchTrim ? (
        <Card title={`Search results (${searchResults.length})`} className={sectionScrollMt}>
          {searchResults.length === 0 ? (
            <p className="text-sm text-slate-500">No items match “{searchQuery.trim()}”.</p>
          ) : (
            <ItemList items={searchResults} {...listProps} />
          )}
        </Card>
      ) : null}

      {!searchTrim
        ? tops.map((top) => {
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
          <Card
            key={top.id}
            title={top.name}
            id={menuSectionDomId(top.id)}
            className={sectionScrollMt}
          >
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
      })
        : null}

      {!searchTrim
        ? orphanSubs.map((sub) => {
        const items = itemsByCategory.get(sub.id) ?? [];
        if (!items.length) return null;
        return (
          <Card
            key={sub.id}
            title={sub.name}
            id={menuSectionDomId(sub.id)}
            className={sectionScrollMt}
          >
            <ItemList items={items} {...listProps} />
          </Card>
        );
      })
        : null}

      {!searchTrim && (itemsByCategory.get("uncategorized") ?? []).length > 0 ? (
        <Card title="Menu" id={menuSectionDomId("uncategorized")} className={sectionScrollMt}>
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
