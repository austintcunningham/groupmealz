"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MenuEntreeBadge } from "@/components/menus/MenuEntreeBadge";
import { MenuItemPhotoUpload } from "@/components/menus/MenuItemPhotoUpload";
import { MenuReorderButtons } from "@/components/menus/MenuReorderButtons";
import { CustomerMenuLivePreview } from "@/components/restaurant/CustomerMenuLivePreview";
import {
  createMenuCategory,
  createMenuItem,
  deleteMenuCategory,
  deleteMenuItem,
  moveMenuCategory,
  moveMenuItem,
  updateMenuCategory,
  updateMenuItem,
  uploadMenuItemImage,
} from "@/lib/actions/menus";
import { effectivePriceCents, isPromoActive } from "@/lib/menus/effective-price";
import {
  categorySelectOptions,
  subcategoriesFor,
  topLevelCategories,
} from "@/lib/menus/category-tree";
import { sortMenuItems } from "@/lib/menus/sort";
import { formatCents, parseDollarsToCents } from "@/lib/money/format";
import { Button, ErrorMessage, Input, Select, SuccessMessage } from "@/components/ui";
import type { MenuCategory, MenuItem } from "@/types/database";

function MenuItemEditorForm({
  item,
  categoryOptions,
  isPending,
  onSave,
  onDelete,
  onMoveUp,
  onMoveDown,
  disableMoveUp,
  disableMoveDown,
  showPlatformFeeHints,
  serviceFeePerEntreeCents,
}: {
  item: MenuItem;
  categoryOptions: { id: string; label: string }[];
  isPending: boolean;
  onSave: (itemId: string, formData: FormData) => void;
  onDelete: (itemId: string, itemName: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  disableMoveUp: boolean;
  disableMoveDown: boolean;
  showPlatformFeeHints: boolean;
  serviceFeePerEntreeCents: number;
}) {
  const promo = isPromoActive(item);
  const charge = effectivePriceCents(item);

  return (
    <li className="flex gap-2 rounded-lg border border-slate-200 bg-white p-4">
      <MenuReorderButtons
        label={item.name}
        loading={isPending}
        disableUp={disableMoveUp}
        disableDown={disableMoveDown}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
      />
      <form
        className="min-w-0 flex-1 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          onSave(item.id, new FormData(e.currentTarget));
        }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <MenuEntreeBadge
            countsAsEntree={item.counts_as_entree}
            showPlatformFeeHints={showPlatformFeeHints}
          />
          {!item.available ? (
            <span className="text-xs font-medium text-amber-700">Sold out</span>
          ) : null}
          {promo ? (
            <span className="text-xs font-medium text-green-700">
              Deal → {formatCents(charge)}
            </span>
          ) : null}
          <span className="ml-auto text-sm text-slate-500">
            Regular {formatCents(item.price_cents)}
          </span>
        </div>
        <Input name="name" label="Name" defaultValue={item.name} required />
        <Input name="description" label="Description" defaultValue={item.description ?? ""} />
        <MenuItemPhotoUpload
          menuItemId={item.id}
          imageUrl={item.image_url}
          itemName={item.name}
        />
        {categoryOptions.length > 0 ? (
          <Select name="category_id" label="Category" defaultValue={item.category_id ?? ""}>
            {categoryOptions.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </Select>
        ) : null}
        <Input
          name="price"
          label="Regular price (USD)"
          type="number"
          step="0.01"
          min="0"
          defaultValue={(item.price_cents / 100).toFixed(2)}
          required
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="available"
            defaultChecked={item.available}
            className="rounded"
          />
          Available to order
        </label>
        <label className="flex items-start gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
          <input
            type="checkbox"
            name="counts_as_entree"
            defaultChecked={item.counts_as_entree !== false}
            className="mt-0.5 rounded"
          />
          <span>
            {showPlatformFeeHints ? (
              <>
                <strong>Counts as entrée</strong> — customer pays{" "}
                {formatCents(serviceFeePerEntreeCents)} service fee per quantity. Uncheck for
                sides, drinks, and extras.
              </>
            ) : (
              <>
                <strong>Counts as entrée</strong> — main dishes and combos. Uncheck for sides,
                drinks, and extras.
              </>
            )}
          </span>
        </label>
        <div className="rounded-md border border-dashed border-[var(--geaux-yellow)] bg-amber-50/50 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
            Temporary deal
          </p>
          <Input
            name="promo_label"
            label="Deal label (optional)"
            defaultValue={item.promo_label ?? ""}
            placeholder="Today only, $2 off…"
          />
          <Input
            name="promo_price"
            label="Promo price (USD, leave blank to clear)"
            type="number"
            step="0.01"
            min="0"
            defaultValue={
              item.promo_price_cents != null ? (item.promo_price_cents / 100).toFixed(2) : ""
            }
          />
          <Input
            name="promo_ends_at"
            label="Deal ends (date, optional)"
            type="date"
            defaultValue={item.promo_ends_at ?? ""}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" variant="secondary" size="sm" loading={isPending}>
            Save item
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            loading={isPending}
            onClick={() => onDelete(item.id, item.name)}
          >
            Delete item
          </Button>
        </div>
      </form>
    </li>
  );
}

export function RestaurantMenuEditor({
  restaurantId: initialRestaurantId,
  restaurantName: initialRestaurantName,
  categories,
  menuItems,
  restaurants,
  serviceFeePerEntreeCents = 250,
  showPlatformFeeHints = false,
}: {
  restaurantId: string;
  restaurantName: string;
  categories: MenuCategory[];
  menuItems: MenuItem[];
  restaurants?: { id: string; name: string }[];
  serviceFeePerEntreeCents?: number;
  /** Admin menu tools: show platform fee copy on entrée badges and checkboxes. */
  showPlatformFeeHints?: boolean;
}) {
  const router = useRouter();
  const [restaurantId, setRestaurantId] = useState(initialRestaurantId);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const restaurantName =
    restaurants?.find((r) => r.id === restaurantId)?.name ?? initialRestaurantName;

  const restaurantCategories = useMemo(
    () => categories.filter((c) => c.restaurant_id === restaurantId),
    [categories, restaurantId]
  );

  const topCategories = useMemo(
    () => topLevelCategories(restaurantCategories),
    [restaurantCategories]
  );

  const itemCategoryOptions = useMemo(
    () => categorySelectOptions(restaurantCategories),
    [restaurantCategories]
  );

  const restaurantItems = useMemo(
    () => menuItems.filter((i) => i.restaurant_id === restaurantId),
    [menuItems, restaurantId]
  );

  const uncategorizedItems = useMemo(
    () => sortMenuItems(restaurantItems.filter((i) => !i.category_id)),
    [restaurantItems]
  );

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

  function moveItem(itemId: string, direction: "up" | "down") {
    setError(null);
    startTransition(async () => {
      const result = await moveMenuItem(itemId, direction);
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

  function countItemsInCategoryTree(categoryId: string, includeSubs: boolean): number {
    let n = restaurantItems.filter((i) => i.category_id === categoryId).length;
    if (includeSubs) {
      for (const sub of subcategoriesFor(restaurantCategories, categoryId)) {
        n += restaurantItems.filter((i) => i.category_id === sub.id).length;
      }
    }
    return n;
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
      router.refresh();
    });
  }

  function saveItem(itemId: string, formData: FormData) {
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
        flash("Item updated");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Invalid values");
      }
    });
  }

  function renderItemList(items: MenuItem[]) {
    if (!items.length) {
      return <p className="py-2 text-sm text-slate-500">No items here yet.</p>;
    }
    return (
      <ul className="space-y-3">
        {items.map((item, itemIndex) => (
          <MenuItemEditorForm
            key={item.id}
            item={item}
            categoryOptions={itemCategoryOptions}
            isPending={isPending}
            onSave={saveItem}
            onDelete={removeItem}
            disableMoveUp={itemIndex === 0}
            disableMoveDown={itemIndex === items.length - 1}
            onMoveUp={() => moveItem(item.id, "up")}
            onMoveDown={() => moveItem(item.id, "down")}
            showPlatformFeeHints={showPlatformFeeHints}
            serviceFeePerEntreeCents={serviceFeePerEntreeCents}
          />
        ))}
      </ul>
    );
  }

  function renderSubCategorySection(sub: MenuCategory, subIndex: number, subs: MenuCategory[]) {
    const items = sortMenuItems(restaurantItems.filter((i) => i.category_id === sub.id));
    return (
      <div key={sub.id} className="ml-2 border-l-2 border-[var(--geaux-yellow)] pl-4 sm:ml-4">
        <div className="mb-3 flex flex-wrap items-end gap-2">
          <MenuReorderButtons
            label={`${sub.name} sub-category`}
            loading={isPending}
            disableUp={subIndex === 0}
            disableDown={subIndex === subs.length - 1}
            onMoveUp={() => moveCategory(sub.id, "up")}
            onMoveDown={() => moveCategory(sub.id, "down")}
          />
          <form
            className="flex min-w-0 flex-1 flex-wrap items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              saveCategoryName(sub.id, new FormData(e.currentTarget));
            }}
          >
            <div className="min-w-[10rem] flex-1">
              <Input name="name" label="Sub-category" defaultValue={sub.name} required />
            </div>
            <Button type="submit" variant="secondary" size="sm" loading={isPending}>
              Save
            </Button>
          </form>
          <Button
            type="button"
            variant="danger"
            size="sm"
            loading={isPending}
            onClick={() =>
              removeCategory(sub.id, sub.name, items.length, 0)
            }
          >
            Delete
          </Button>
        </div>
        {renderItemList(items)}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {restaurants && restaurants.length > 1 ? (
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
      ) : null}

      {error ? <ErrorMessage message={error} /> : null}
      {success ? <SuccessMessage message={success} /> : null}

      <CustomerMenuLivePreview
        categories={restaurantCategories}
        menuItems={restaurantItems}
        restaurantName={restaurantName}
      />

      {!showPlatformFeeHints ? (
        <p className="text-sm text-slate-600">
          Each item shows an <strong>Entrée</strong> or <strong>Not entrée</strong> badge — use the
          checkbox on an item to fix sides and drinks.
        </p>
      ) : null}

      <p className="text-sm text-slate-600">
        Use <strong>sub-categories</strong> under each top section (e.g. Hot / Cold subs).{" "}
        <strong>↑ ↓</strong> reorders categories, sub-categories, and items on the customer menu.
      </p>

      <form
        className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          addCategory(new FormData(e.currentTarget));
        }}
      >
        <h3 className="font-medium text-slate-900">Add category</h3>
        <Input name="category_name" required placeholder="Sandwiches, Bowls, Sides…" />
        <Select name="parent_id" label="Under (optional)" defaultValue="">
          <option value="">Top-level category</option>
          {topCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              Sub-category of {cat.name}
            </option>
          ))}
        </Select>
        <Button type="submit" size="sm" loading={isPending}>
          Add category
        </Button>
      </form>

      <form
        className="space-y-3 border-t border-slate-100 pt-6"
        onSubmit={(e) => {
          e.preventDefault();
          addItem(new FormData(e.currentTarget));
        }}
      >
        <h3 className="font-medium text-slate-900">Add menu item</h3>
        <Input name="item_name" label="Name" required />
        <Input name="description" label="Description" />
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Photo (optional)
          </label>
          <input
            type="file"
            name="photo"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="text-sm text-slate-600 file:mr-2 file:rounded-md file:border-0 file:bg-[var(--geaux-red)] file:px-3 file:py-1.5 file:text-sm file:text-white"
          />
          <p className="mt-1 text-xs text-slate-500">Or add a photo after saving under the item.</p>
        </div>
        <Input name="price" label="Regular price (USD)" required type="number" step="0.01" min="0" />
        <Select name="category_id" label="Category" required={itemCategoryOptions.length > 0}>
          {itemCategoryOptions.length === 0 ? (
            <option value="">Add a category first</option>
          ) : (
            itemCategoryOptions.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))
          )}
        </Select>
        <label className="flex items-start gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
          <input type="checkbox" name="counts_as_entree" defaultChecked className="mt-0.5 rounded" />
          <span>
            {showPlatformFeeHints ? (
              <>
                <strong>Counts as entrée</strong> — {formatCents(serviceFeePerEntreeCents)} service
                fee per quantity
              </>
            ) : (
              <>
                <strong>Counts as entrée</strong> — main dish or combo (uncheck for sides and
                drinks)
              </>
            )}
          </span>
        </label>
        <Button type="submit" loading={isPending} disabled={!restaurantCategories.length}>
          Add item
        </Button>
      </form>

      <div className="border-t border-slate-100 pt-6">
        <h3 className="mb-4 font-medium text-slate-900">{restaurantName} — current menu</h3>
        {!restaurantCategories.length && !restaurantItems.length ? (
          <p className="text-sm text-slate-500">No categories or items yet.</p>
        ) : (
          <div className="space-y-8">
            {topCategories.map((cat, catIndex) => {
              const subs = subcategoriesFor(restaurantCategories, cat.id);
              const topItems = sortMenuItems(
                restaurantItems.filter((i) => i.category_id === cat.id)
              );
              const treeItemCount = countItemsInCategoryTree(cat.id, true);
              return (
                <section key={cat.id} className="rounded-xl border border-slate-200 bg-slate-50/80">
                  <div className="flex flex-wrap items-end gap-2 border-b border-slate-200 p-4">
                    <MenuReorderButtons
                      label={`${cat.name} category`}
                      loading={isPending}
                      disableUp={catIndex === 0}
                      disableDown={catIndex === topCategories.length - 1}
                      onMoveUp={() => moveCategory(cat.id, "up")}
                      onMoveDown={() => moveCategory(cat.id, "down")}
                    />
                    <form
                      className="flex min-w-0 flex-1 flex-wrap items-end gap-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        saveCategoryName(cat.id, new FormData(e.currentTarget));
                      }}
                    >
                      <div className="min-w-[12rem] flex-1">
                        <Input name="name" label="Category name" defaultValue={cat.name} required />
                      </div>
                      <Button type="submit" variant="secondary" size="sm" loading={isPending}>
                        Save name
                      </Button>
                    </form>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      loading={isPending}
                      onClick={() =>
                        removeCategory(cat.id, cat.name, treeItemCount, subs.length)
                      }
                    >
                      Delete category
                    </Button>
                  </div>
                  <div className="space-y-6 p-4">
                    {subs.map((sub, subIndex) => renderSubCategorySection(sub, subIndex, subs))}
                    <form
                      className="flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-slate-200 bg-white p-3"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const fd = new FormData(e.currentTarget);
                        addSubCategory(cat.id, String(fd.get("sub_name") ?? ""));
                        e.currentTarget.reset();
                      }}
                    >
                      <div className="min-w-[10rem] flex-1">
                        <Input
                          name="sub_name"
                          label={`Add sub-category under ${cat.name}`}
                          placeholder="Hot subs, Cold subs…"
                          required
                        />
                      </div>
                      <Button type="submit" variant="secondary" size="sm" loading={isPending}>
                        Add sub-category
                      </Button>
                    </form>
                    {topItems.length > 0 ? (
                      <div className={subs.length ? "border-t border-slate-200 pt-4" : undefined}>
                        {subs.length > 0 ? (
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Items in {cat.name} (not in a sub-category)
                          </p>
                        ) : null}
                        {renderItemList(topItems)}
                      </div>
                    ) : subs.length === 0 ? (
                      <p className="text-sm text-slate-500">No items in this category yet.</p>
                    ) : null}
                  </div>
                </section>
              );
            })}

            {uncategorizedItems.length > 0 ? (
              <section className="rounded-xl border border-dashed border-slate-300">
                <h4 className="border-b border-slate-200 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Uncategorized
                </h4>
                <div className="p-4">{renderItemList(uncategorizedItems)}</div>
              </section>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
