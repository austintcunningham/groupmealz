"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MenuEntreeBadge } from "@/components/menus/MenuEntreeBadge";
import { CustomerMenuLivePreview } from "@/components/restaurant/CustomerMenuLivePreview";
import {
  createMenuCategory,
  createMenuItem,
  deleteMenuCategory,
  deleteMenuItem,
  updateMenuCategory,
  updateMenuItem,
} from "@/lib/actions/menus";
import { effectivePriceCents, isPromoActive } from "@/lib/menus/effective-price";
import { formatCents, parseDollarsToCents } from "@/lib/money/format";
import { Button, ErrorMessage, Input, Select, SuccessMessage } from "@/components/ui";
import type { MenuCategory, MenuItem } from "@/types/database";

function MenuItemEditorForm({
  item,
  categories,
  isPending,
  onSave,
  onDelete,
}: {
  item: MenuItem;
  categories: MenuCategory[];
  isPending: boolean;
  onSave: (itemId: string, formData: FormData) => void;
  onDelete: (itemId: string, itemName: string) => void;
}) {
  const promo = isPromoActive(item);
  const charge = effectivePriceCents(item);

  return (
    <li className="rounded-lg border border-slate-200 bg-white p-4">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          onSave(item.id, new FormData(e.currentTarget));
        }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <MenuEntreeBadge countsAsEntree={item.counts_as_entree} />
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
        <Input
          name="image_url"
          label="Photo URL (HTTPS, optional)"
          type="url"
          defaultValue={item.image_url ?? ""}
          placeholder="https://…"
        />
        {categories.length > 0 ? (
          <Select name="category_id" label="Category" defaultValue={item.category_id ?? ""}>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
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
            <strong>Counts as entrée</strong> — customer pays the per-entrée service fee on each
            quantity. Uncheck for sides, drinks, and extras.
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
}: {
  restaurantId: string;
  restaurantName: string;
  categories: MenuCategory[];
  menuItems: MenuItem[];
  restaurants?: { id: string; name: string }[];
  serviceFeePerEntreeCents?: number;
}) {
  const router = useRouter();
  const [restaurantId, setRestaurantId] = useState(initialRestaurantId);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const restaurantName =
    restaurants?.find((r) => r.id === restaurantId)?.name ?? initialRestaurantName;

  const restaurantCategories = useMemo(
    () =>
      categories
        .filter((c) => c.restaurant_id === restaurantId)
        .sort((a, b) => a.display_order - b.display_order || a.name.localeCompare(b.name)),
    [categories, restaurantId]
  );

  const restaurantItems = useMemo(
    () => menuItems.filter((i) => i.restaurant_id === restaurantId),
    [menuItems, restaurantId]
  );

  const uncategorizedItems = useMemo(
    () => restaurantItems.filter((i) => !i.category_id),
    [restaurantItems]
  );

  function flash(message: string) {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3500);
  }

  function addCategory(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createMenuCategory({
        restaurant_id: restaurantId,
        name: String(formData.get("category_name") ?? ""),
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      flash("Category added");
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

  function removeCategory(categoryId: string, categoryName: string, itemCount: number) {
    const msg =
      itemCount > 0
        ? `Delete category "${categoryName}"? ${itemCount} item(s) will move to Uncategorized.`
        : `Delete category "${categoryName}"?`;
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
        const imageRaw = String(formData.get("image_url") ?? "").trim();
        const result = await createMenuItem({
          restaurant_id: restaurantId,
          category_id: categoryId || null,
          name: String(formData.get("item_name") ?? ""),
          description: String(formData.get("description") ?? "") || undefined,
          image_url: imageRaw || null,
          price_cents: parseDollarsToCents(String(formData.get("price") ?? "0")),
          counts_as_entree: formData.has("counts_as_entree"),
        });
        if (!result.success) {
          setError(result.error);
          return;
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
        const imageRaw = String(formData.get("image_url") ?? "").trim();
        const result = await updateMenuItem({
          id: itemId,
          name: String(formData.get("name") ?? ""),
          description: String(formData.get("description") ?? "") || null,
          category_id: categoryId || null,
          image_url: imageRaw || null,
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
        serviceFeePerEntreeCents={serviceFeePerEntreeCents}
      />

      <p className="text-sm text-slate-600">
        Items marked <strong>Entrée</strong> include the per-entrée service fee at checkout. Sides
        and drinks should be <strong>Not entrée</strong>.
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
        <Input
          name="image_url"
          label="Photo URL (HTTPS, optional)"
          type="url"
          placeholder="https://…"
        />
        <Input name="price" label="Regular price (USD)" required type="number" step="0.01" min="0" />
        <Select name="category_id" label="Category" required={restaurantCategories.length > 0}>
          {restaurantCategories.length === 0 ? (
            <option value="">Add a category first</option>
          ) : (
            restaurantCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))
          )}
        </Select>
        <label className="flex items-start gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
          <input type="checkbox" name="counts_as_entree" defaultChecked className="mt-0.5 rounded" />
          <span>
            <strong>Counts as entrée</strong> — service fee applies per quantity
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
            {restaurantCategories.map((cat) => {
              const items = restaurantItems.filter((i) => i.category_id === cat.id);
              return (
                <section key={cat.id} className="rounded-xl border border-slate-200 bg-slate-50/80">
                  <div className="flex flex-wrap items-end gap-2 border-b border-slate-200 p-4">
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
                      onClick={() => removeCategory(cat.id, cat.name, items.length)}
                    >
                      Delete category
                    </Button>
                  </div>
                  {items.length === 0 ? (
                    <p className="p-4 text-sm text-slate-500">No items in this category.</p>
                  ) : (
                    <ul className="space-y-3 p-4">
                      {items.map((item) => (
                        <MenuItemEditorForm
                          key={item.id}
                          item={item}
                          categories={restaurantCategories}
                          isPending={isPending}
                          onSave={saveItem}
                          onDelete={removeItem}
                        />
                      ))}
                    </ul>
                  )}
                </section>
              );
            })}

            {uncategorizedItems.length > 0 ? (
              <section className="rounded-xl border border-dashed border-slate-300">
                <h4 className="border-b border-slate-200 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Uncategorized
                </h4>
                <ul className="space-y-3 p-4">
                  {uncategorizedItems.map((item) => (
                    <MenuItemEditorForm
                      key={item.id}
                      item={item}
                      categories={restaurantCategories}
                      isPending={isPending}
                      onSave={saveItem}
                      onDelete={removeItem}
                    />
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
