"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DraggableCustomerMenuPreview } from "@/components/restaurant/DraggableCustomerMenuPreview";
import { MenuAddItemModal } from "@/components/restaurant/MenuAddItemModal";
import { MenuCategoriesModal } from "@/components/restaurant/MenuCategoriesModal";
import { MenuItemEditModal } from "@/components/restaurant/MenuItemEditModal";
import {
  createMenuCategory,
  createMenuItem,
  deleteMenuCategory,
  deleteMenuItem,
  moveMenuCategory,
  syncMenuItemOptions,
  updateMenuCategory,
  updateMenuItem,
  uploadMenuItemImage,
} from "@/lib/actions/menus";
import {
  categorySelectOptions,
  filterEditorMenuCategories,
} from "@/lib/menus/category-tree";
import { sortMenuItems } from "@/lib/menus/sort";
import { parseDollarsToCents } from "@/lib/money/format";
import { Button, ErrorMessage, Input, Select, SuccessMessage } from "@/components/ui";
import type { MenuCategory, MenuItem, MenuItemIngredient, MenuItemSize } from "@/types/database";

function MenuEditorItemSearch({
  items,
  categories,
  query,
  onQueryChange,
  onSelectItem,
}: {
  items: MenuItem[];
  categories: MenuCategory[];
  query: string;
  onQueryChange: (next: string) => void;
  onSelectItem: (itemId: string) => void;
}) {
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return sortMenuItems(items).filter(
      (i) =>
        i.name.toLowerCase().includes(q) || (i.description ?? "").toLowerCase().includes(q)
    );
  }, [query, items]);

  function categoryLabel(item: MenuItem): string {
    const cat = categories.find((c) => c.id === item.category_id);
    if (!cat) return "Uncategorized";
    if (cat.parent_id) {
      const parent = categories.find((c) => c.id === cat.parent_id);
      return parent ? `${parent.name} › ${cat.name}` : cat.name;
    }
    return cat.name;
  }

  return (
    <div>
      <Input
        label="Find a menu item"
        placeholder="Search by name — pick a result to edit…"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
      />
      {query.trim() ? (
        <p className="mt-1 text-xs text-slate-500">
          {matches.length
            ? `${matches.length} match${matches.length === 1 ? "" : "es"}`
            : "No matches"}
        </p>
      ) : null}
      {matches.length > 0 ? (
        <ul className="mt-2 max-h-44 space-y-0.5 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50/80 p-1">
          {matches.slice(0, 25).map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="w-full rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-white"
                onClick={() => onSelectItem(item.id)}
              >
                <span className="font-medium text-slate-900">{item.name}</span>
                <span className="mt-0.5 block text-xs text-slate-500">{categoryLabel(item)}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/** Shared menu creator for Admin → Menus and Restaurant → Menu (managers). */
export function RestaurantMenuEditor({
  restaurantId: initialRestaurantId,
  restaurantName: initialRestaurantName,
  categories,
  menuItems,
  restaurants,
  serviceFeePerEntreeCents = 250,
  showPlatformFeeHints = false,
  sizesByMenuItemId = {},
  ingredientsByMenuItemId = {},
}: {
  restaurantId: string;
  restaurantName: string;
  categories: MenuCategory[];
  menuItems: MenuItem[];
  restaurants?: { id: string; name: string }[];
  serviceFeePerEntreeCents?: number;
  showPlatformFeeHints?: boolean;
  sizesByMenuItemId?: Record<string, MenuItemSize[]>;
  ingredientsByMenuItemId?: Record<string, MenuItemIngredient[]>;
}) {
  const router = useRouter();
  const [restaurantId, setRestaurantId] = useState(initialRestaurantId);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [itemSearchQuery, setItemSearchQuery] = useState("");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const restaurantName =
    restaurants?.find((r) => r.id === restaurantId)?.name ?? initialRestaurantName;

  const restaurantCategories = useMemo(
    () => categories.filter((c) => c.restaurant_id === restaurantId),
    [categories, restaurantId]
  );

  const itemCategoryOptions = useMemo(
    () => categorySelectOptions(restaurantCategories),
    [restaurantCategories]
  );

  const restaurantItems = useMemo(
    () => menuItems.filter((i) => i.restaurant_id === restaurantId),
    [menuItems, restaurantId]
  );

  const editorMenuItems = useMemo(
    () => sortMenuItems(restaurantItems.filter((i) => i.active)),
    [restaurantItems]
  );

  const editorCategories = useMemo(
    () => filterEditorMenuCategories(restaurantCategories, restaurantItems),
    [restaurantCategories, restaurantItems]
  );

  const editingItem = editingItemId
    ? restaurantItems.find((i) => i.id === editingItemId) ?? null
    : null;

  function openEditItem(itemId: string) {
    setEditingItemId(itemId);
    const item = restaurantItems.find((i) => i.id === itemId);
    if (item) setItemSearchQuery(item.name);
  }

  function moveCategory(categoryId: string, direction: "up" | "down") {
    setError(null);
    startTransition(async () => {
      const result = await moveMenuCategory(categoryId, direction);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function flash(message: string) {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3500);
  }

  function addCategory(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const parentRaw = String(formData.get("parent_id") ?? "").trim();
      const result = await createMenuCategory({
        restaurant_id: restaurantId,
        name: String(formData.get("category_name") ?? ""),
        parent_id: parentRaw || null,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      flash(parentRaw ? "Sub-category added" : "Category added");
      router.refresh();
    });
  }

  function addSubCategory(parentId: string, name: string) {
    if (!name.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await createMenuCategory({
        restaurant_id: restaurantId,
        name: name.trim(),
        parent_id: parentId,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      flash("Sub-category added");
      router.refresh();
    });
  }

  function saveCategoryName(categoryId: string, formData: FormData) {
    setError(null);
    startTransition(async () => {
      const name = String(formData.get("name") ?? "").trim();
      const result = await updateMenuCategory({ id: categoryId, name });
      if (!result.success) {
        setError(result.error);
        return;
      }
      flash("Category renamed");
      router.refresh();
    });
  }

  function removeCategory(
    categoryId: string,
    categoryName: string,
    itemCount: number,
    subCount: number
  ) {
    let msg = `Delete "${categoryName}"?`;
    if (subCount > 0) {
      msg += ` ${subCount} sub-categor${subCount === 1 ? "y" : "ies"} will be removed.`;
    }
    if (itemCount > 0) {
      msg += ` ${itemCount} item(s) will move to Uncategorized.`;
    }
    if (!window.confirm(msg)) return;

    setError(null);
    startTransition(async () => {
      const result = await deleteMenuCategory(categoryId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      flash("Category deleted");
      router.refresh();
    });
  }

  function addItem(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        const categoryId = String(formData.get("category_id") ?? "");
        const photo = formData.get("photo");
        const result = await createMenuItem({
          restaurant_id: restaurantId,
          category_id: categoryId || null,
          name: String(formData.get("item_name") ?? ""),
          description: String(formData.get("description") ?? "") || undefined,
          price_cents: parseDollarsToCents(String(formData.get("price") ?? "0")),
          counts_as_entree: formData.has("counts_as_entree"),
        });
        if (!result.success) {
          setError(result.error);
          return;
        }
        if (photo instanceof File && photo.size > 0) {
          const fd = new FormData();
          fd.set("file", photo);
          const up = await uploadMenuItemImage(result.data.id, fd);
          if (!up.success) {
            setError(`Item saved but photo upload failed: ${up.error}`);
            router.refresh();
            return;
          }
        }
        flash("Menu item added");
        setAddItemOpen(false);
        if (result.data?.id) setEditingItemId(result.data.id);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Invalid price");
      }
    });
  }

  function removeItem(itemId: string, itemName: string) {
    if (!window.confirm(`Delete menu item "${itemName}"? This cannot be undone.`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteMenuItem(itemId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      flash("Item deleted");
      setEditingItemId(null);
      router.refresh();
    });
  }

  const saveItem = useCallback(
    (itemId: string, formData: FormData) => {
      setError(null);
      startTransition(async () => {
        try {
          const promoPriceRaw = String(formData.get("promo_price") ?? "").trim();
          const promoEnds = String(formData.get("promo_ends_at") ?? "").trim();
          const categoryId = String(formData.get("category_id") ?? "").trim();
          const result = await updateMenuItem({
            id: itemId,
            name: String(formData.get("name") ?? ""),
            description: String(formData.get("description") ?? "") || null,
            category_id: categoryId || null,
            price_cents: parseDollarsToCents(String(formData.get("price") ?? "0")),
            available: formData.get("available") === "on",
            counts_as_entree: formData.get("counts_as_entree") === "on",
            promo_label: String(formData.get("promo_label") ?? "").trim() || null,
            promo_price_cents: promoPriceRaw ? parseDollarsToCents(promoPriceRaw) : null,
            promo_ends_at: promoEnds || null,
          });
          if (!result.success) {
            setError(result.error);
            return;
          }
          const payloadRaw = String(formData.get("options_payload") ?? "");
          if (payloadRaw) {
            const parsed = JSON.parse(payloadRaw) as {
              sizes: { name: string; price_cents: number; is_default?: boolean }[];
              ingredients: { name: string }[];
            };
            const syncResult = await syncMenuItemOptions({
              menuItemId: itemId,
              sizes: parsed.sizes ?? [],
              ingredients: parsed.ingredients ?? [],
            });
            if (!syncResult.success) {
              setError(syncResult.error);
              router.refresh();
              return;
            }
          }
          flash("Item updated");
          setEditingItemId(null);
          router.refresh();
        } catch (e) {
          setError(e instanceof Error ? e.message : "Invalid values");
        }
      });
    },
    [router]
  );

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-30 -mx-1 space-y-3 rounded-[var(--geaux-radius-lg)] border border-slate-200/80 bg-[var(--geaux-cream)]/95 p-4 shadow-sm backdrop-blur-sm">
        <div className="flex flex-wrap items-end gap-3">
          {restaurants && restaurants.length > 1 ? (
            <div className="min-w-[12rem] flex-1">
              <Select
                label="Restaurant"
                value={restaurantId}
                onChange={(e) => setRestaurantId(e.target.value)}
              >
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </Select>
            </div>
          ) : (
            <p className="text-sm font-medium text-slate-800">{restaurantName}</p>
          )}
          <Button type="button" variant="secondary" size="sm" onClick={() => setCategoriesOpen(true)}>
            Categories
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => setAddItemOpen(true)}
            disabled={!restaurantCategories.length}
          >
            Add item
          </Button>
        </div>

        <MenuEditorItemSearch
          items={restaurantItems}
          categories={restaurantCategories}
          query={itemSearchQuery}
          onQueryChange={setItemSearchQuery}
          onSelectItem={openEditItem}
        />

        {error ? <ErrorMessage message={error} /> : null}
        {success ? <SuccessMessage message={success} /> : null}
      </div>

      <div className="mx-auto max-w-3xl">
        <p className="mb-3 text-sm text-slate-600">
          This is what customers see when ordering. Use <strong>Edit</strong> on any item, drag the{" "}
          <span className="font-mono text-xs">≡</span> handle to reorder, or open{" "}
          <strong>Categories</strong> to add sections. Sold-out items stay visible here with a badge.
        </p>

        <DraggableCustomerMenuPreview
          layout="full"
          editorMode
          allCategories={restaurantCategories}
          allMenuItems={restaurantItems}
          visibleCategories={editorCategories}
          visibleItems={editorMenuItems}
          sizesByMenuItemId={sizesByMenuItemId}
          ingredientsByMenuItemId={ingredientsByMenuItemId}
          onEditItem={openEditItem}
        />
      </div>

      <MenuItemEditModal
        item={editingItem}
        categoryOptions={itemCategoryOptions}
        isPending={isPending}
        showPlatformFeeHints={showPlatformFeeHints}
        serviceFeePerEntreeCents={serviceFeePerEntreeCents}
        itemSizes={editingItem ? (sizesByMenuItemId[editingItem.id] ?? []) : []}
        itemIngredients={
          editingItem ? (ingredientsByMenuItemId[editingItem.id] ?? []) : []
        }
        onSave={saveItem}
        onDelete={removeItem}
        onClose={() => setEditingItemId(null)}
      />

      <MenuAddItemModal
        open={addItemOpen}
        categoryOptions={itemCategoryOptions}
        showPlatformFeeHints={showPlatformFeeHints}
        serviceFeePerEntreeCents={serviceFeePerEntreeCents}
        isPending={isPending}
        onSubmit={addItem}
        onClose={() => setAddItemOpen(false)}
      />

      <MenuCategoriesModal
        open={categoriesOpen}
        categories={restaurantCategories}
        menuItems={restaurantItems}
        isPending={isPending}
        onClose={() => setCategoriesOpen(false)}
        onAddCategory={addCategory}
        onSaveCategoryName={saveCategoryName}
        onAddSubCategory={addSubCategory}
        onRemoveCategory={removeCategory}
        onMoveCategory={moveCategory}
      />
    </div>
  );
}
