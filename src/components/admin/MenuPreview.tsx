"use client";

import { useMemo, useState } from "react";
import { formatCents } from "@/lib/money/format";
import { EmptyState, Select } from "@/components/ui";
import type { MenuCategory, MenuItem, Restaurant } from "@/types/database";

export function MenuPreview({
  restaurants,
  categories,
  menuItems,
}: {
  restaurants: Restaurant[];
  categories: MenuCategory[];
  menuItems: MenuItem[];
}) {
  const [restaurantId, setRestaurantId] = useState(restaurants[0]?.id ?? "");

  const restaurantCategories = useMemo(
    () =>
      categories
        .filter((c) => c.restaurant_id === restaurantId)
        .sort((a, b) => a.display_order - b.display_order),
    [categories, restaurantId]
  );

  const restaurantItems = useMemo(
    () => menuItems.filter((i) => i.restaurant_id === restaurantId),
    [menuItems, restaurantId]
  );

  if (!restaurants.length) {
    return <EmptyState message="No restaurants yet." />;
  }

  return (
    <div className="space-y-4">
      <Select
        label="Preview restaurant menu"
        value={restaurantId}
        onChange={(e) => setRestaurantId(e.target.value)}
      >
        {restaurants.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </Select>

      {restaurantItems.length === 0 ? (
        <EmptyState message="No menu items for this restaurant yet." />
      ) : (
        <div className="space-y-6">
          {restaurantCategories.map((cat) => {
            const items = restaurantItems.filter((i) => i.category_id === cat.id);
            if (items.length === 0) return null;
            return (
              <div key={cat.id}>
                <h3 className="mb-2 border-b border-slate-200 pb-1 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  {cat.name}
                </h3>
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-start justify-between rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-50"
                    >
                      <div>
                        <p className="font-medium text-slate-900">{item.name}</p>
                        {item.description ? (
                          <p className="text-sm text-slate-500">{item.description}</p>
                        ) : null}
                      </div>
                      <span className="ml-4 shrink-0 font-medium text-slate-700">
                        {formatCents(item.price_cents)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          {restaurantItems.filter((i) => !i.category_id).length > 0 ? (
            <div>
              <h3 className="mb-2 border-b border-slate-200 pb-1 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Uncategorized
              </h3>
              <ul className="space-y-2">
                {restaurantItems
                  .filter((i) => !i.category_id)
                  .map((item) => (
                    <li
                      key={item.id}
                      className="flex justify-between rounded-lg px-2 py-1.5 hover:bg-slate-50"
                    >
                      <span className="font-medium">{item.name}</span>
                      <span>{formatCents(item.price_cents)}</span>
                    </li>
                  ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
