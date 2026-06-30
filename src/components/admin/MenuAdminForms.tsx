"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createMenuCategory, createMenuItem } from "@/lib/actions/menus";
import { parseDollarsToCents } from "@/lib/money/format";
import { Button, ErrorMessage, Input, Select, SuccessMessage } from "@/components/ui";
import type { MenuCategory, MenuItem, Restaurant } from "@/types/database";

export function MenuAdminForms({
  restaurants,
  categories,
  menuItems,
}: {
  restaurants: Restaurant[];
  categories: MenuCategory[];
  menuItems: MenuItem[];
}) {
  const router = useRouter();
  const [restaurantId, setRestaurantId] = useState(restaurants[0]?.id ?? "");
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

  function flashSuccess(message: string) {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 4000);
  }

  function createCategory(formData: FormData) {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await createMenuCategory({
        restaurant_id: restaurantId,
        name: String(formData.get("category_name") ?? ""),
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      flashSuccess(`Category "${formData.get("category_name")}" added`);
      router.refresh();
    });
  }

  function createItem(formData: FormData) {
    setError(null);
    setSuccess(null);
    const categoryId = String(formData.get("category_id") ?? "");
    startTransition(async () => {
      try {
        const result = await createMenuItem({
          restaurant_id: restaurantId,
          category_id: categoryId || null,
          name: String(formData.get("item_name") ?? ""),
          description: String(formData.get("description") ?? "") || undefined,
          price_cents: parseDollarsToCents(String(formData.get("price") ?? "0")),
        });
        if (!result.success) {
          setError(result.error);
          return;
        }
        flashSuccess(`Menu item "${formData.get("item_name")}" added`);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Invalid price");
      }
    });
  }

  if (!restaurants.length) {
    return <p className="text-sm text-slate-500">Create a restaurant first.</p>;
  }

  return (
    <div className="space-y-8">
      {error ? <ErrorMessage message={error} /> : null}
      {success ? <SuccessMessage message={success} /> : null}

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

      {/* Current categories for this restaurant */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <h3 className="mb-2 text-sm font-semibold text-slate-700">
          Categories for this restaurant
        </h3>
        {restaurantCategories.length === 0 ? (
          <p className="text-sm text-slate-500">
            No categories yet — add one below.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {restaurantCategories.map((cat) => {
              const count = restaurantItems.filter((i) => i.category_id === cat.id).length;
              return (
                <li
                  key={cat.id}
                  className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm text-blue-800"
                >
                  {cat.name}
                  <span className="ml-1 text-blue-600">({count})</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <form action={createCategory} className="space-y-3 border-t border-slate-100 pt-6">
        <h3 className="font-medium text-slate-900">Add category</h3>
        <Input
          name="category_name"
          required
          placeholder="e.g. Bowls, Sandwiches, Sides"
        />
        <Button type="submit" loading={isPending}>
          Add category
        </Button>
      </form>

      <form action={createItem} className="space-y-3 border-t border-slate-100 pt-6">
        <h3 className="font-medium text-slate-900">Add menu item</h3>
        <Input name="item_name" label="Item name" required placeholder="Chicken teriyaki bowl" />
        <Input name="description" label="Description" placeholder="Optional description" />
        <Input
          name="price"
          label="Price (USD)"
          required
          placeholder="12.50"
          type="number"
          step="0.01"
          min="0"
        />
        <Select
          name="category_id"
          label="Category"
          defaultValue=""
          required={restaurantCategories.length > 0}
        >
          {restaurantCategories.length === 0 ? (
            <option value="">Add a category first</option>
          ) : (
            <>
              <option value="">Uncategorized</option>
              {restaurantCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </>
          )}
        </Select>
        <Button type="submit" loading={isPending} disabled={restaurantCategories.length === 0}>
          Add menu item
        </Button>
        {restaurantCategories.length === 0 ? (
          <p className="text-xs text-amber-700">
            Create at least one category before adding items.
          </p>
        ) : null}
      </form>
    </div>
  );
}
