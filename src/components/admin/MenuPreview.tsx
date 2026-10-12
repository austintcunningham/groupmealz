"use client";

import { useMemo, useState } from "react";
import { MenuEntreeBadge } from "@/components/menus/MenuEntreeBadge";
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
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-slate-900">{item.name}</p>
                          <MenuEntreeBadge countsAsEntree={item.counts_as_entree} compact />
                        </div>
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
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50"
                    >
                      <span className="flex flex-wrap items-center gap-2 font-medium">
                        {item.name}
                        <MenuEntreeBadge countsAsEntree={item.counts_as_entree} compact />
                      </span>
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
