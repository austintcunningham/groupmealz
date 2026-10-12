"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createMenuCategory,
  createMenuItem,
  updateMenuItem,
} from "@/lib/actions/menus";
import { effectivePriceCents, isPromoActive } from "@/lib/menus/effective-price";
import { formatCents, parseDollarsToCents } from "@/lib/money/format";
import { Button, ErrorMessage, Input, Select, SuccessMessage } from "@/components/ui";
import type { MenuCategory, MenuItem } from "@/types/database";

export function RestaurantMenuEditor({
  restaurantId,
  restaurantName,
  categories,
  menuItems,
}: {
  restaurantId: string;
  restaurantName: string;
  categories: MenuCategory[];
  menuItems: MenuItem[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const restaurantCategories = useMemo(
    () => categories.filter((c) => c.restaurant_id === restaurantId),
    [categories, restaurantId]
  );

  const restaurantItems = useMemo(
    () => menuItems.filter((i) => i.restaurant_id === restaurantId),
    [menuItems, restaurantId]
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

  function addItem(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        const categoryId = String(formData.get("category_id") ?? "");
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
        flash("Menu item added");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Invalid price");
      }
    });
  }

  function saveItem(itemId: string, formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        const promoPriceRaw = String(formData.get("promo_price") ?? "").trim();
        const promoEnds = String(formData.get("promo_ends_at") ?? "").trim();
        const result = await updateMenuItem({
          id: itemId,
          name: String(formData.get("name") ?? ""),
          description: String(formData.get("description") ?? "") || null,
          price_cents: parseDollarsToCents(String(formData.get("price") ?? "0")),
          available: formData.get("available") === "on",
          counts_as_entree: formData.get("counts_as_entree") === "on",
          promo_label: String(formData.get("promo_label") ?? "").trim() || null,
          promo_price_cents: promoPriceRaw
            ? parseDollarsToCents(promoPriceRaw)
            : null,
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
      {error ? <ErrorMessage message={error} /> : null}
      {success ? <SuccessMessage message={success} /> : null}

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
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="counts_as_entree" defaultChecked className="rounded" />
          Counts as entrée (service fee applies)
        </label>
        <Button type="submit" loading={isPending} disabled={!restaurantCategories.length}>
          Add item
        </Button>
      </form>

      <div className="border-t border-slate-100 pt-6">
        <h3 className="mb-4 font-medium text-slate-900">{restaurantName} — current menu</h3>
        {!restaurantItems.length ? (
          <p className="text-sm text-slate-500">No items yet.</p>
        ) : (
          <ul className="space-y-4">
            {restaurantItems.map((item) => {
              const promo = isPromoActive(item);
              const charge = effectivePriceCents(item);
              return (
                <li key={item.id} className="rounded-lg border border-slate-200 p-4">
                  <form
                    className="space-y-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      saveItem(item.id, new FormData(e.currentTarget));
                    }}
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900">
                        {item.name}
                        {!item.available ? (
                          <span className="ml-2 text-xs font-normal text-amber-700">Sold out</span>
                        ) : null}
                        {promo ? (
                          <span className="ml-2 text-xs font-normal text-green-700">
                            Deal active → {formatCents(charge)}
                          </span>
                        ) : null}
                      </p>
                      <span className="text-sm text-slate-500">
                        Regular {formatCents(item.price_cents)}
                      </span>
                    </div>
                    <Input name="name" label="Name" defaultValue={item.name} required />
                    <Input name="description" label="Description" defaultValue={item.description ?? ""} />
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
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        name="counts_as_entree"
                        defaultChecked={item.counts_as_entree !== false}
                        className="rounded"
                      />
                      Counts as entrée
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
                          item.promo_price_cents != null
                            ? (item.promo_price_cents / 100).toFixed(2)
                            : ""
                        }
                      />
                      <Input
                        name="promo_ends_at"
                        label="Deal ends (date, optional)"
                        type="date"
                        defaultValue={item.promo_ends_at ?? ""}
                      />
                    </div>
                    <Button type="submit" variant="secondary" size="sm" loading={isPending}>
                      Save item
                    </Button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
