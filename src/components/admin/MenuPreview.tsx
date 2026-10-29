"use client";

import { useMemo, useState } from "react";
import {
  CustomerOrderMenu,
  filterCustomerFacingMenu,
} from "@/components/order/CustomerOrderMenu";
import { EmptyState, Select } from "@/components/ui";
import type {
  MenuCategory,
  MenuItem,
  MenuItemIngredient,
  MenuItemSize,
  Restaurant,
} from "@/types/database";

export function MenuPreview({
  restaurants,
  categories,
  menuItems,
  sizesByMenuItemId = {},
  ingredientsByMenuItemId = {},
}: {
  restaurants: Restaurant[];
  categories: MenuCategory[];
  menuItems: MenuItem[];
  sizesByMenuItemId?: Record<string, MenuItemSize[]>;
  ingredientsByMenuItemId?: Record<string, MenuItemIngredient[]>;
}) {
  const [restaurantId, setRestaurantId] = useState(restaurants[0]?.id ?? "");

  const { categories: visibleCats, menuItems: visibleItems } = useMemo(() => {
    const cats = categories.filter((c) => c.restaurant_id === restaurantId);
    const items = menuItems.filter((i) => i.restaurant_id === restaurantId);
    return filterCustomerFacingMenu(cats, items);
  }, [categories, menuItems, restaurantId]);

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

      <p className="text-xs text-slate-500">
        Customer-facing view (hidden items stay visible but marked unavailable).
      </p>

      <CustomerOrderMenu
        categories={visibleCats}
        menuItems={visibleItems}
        interactive={false}
        showItemOptions
        sizesByMenuItemId={sizesByMenuItemId}
        ingredientsByMenuItemId={ingredientsByMenuItemId}
        emptyMessage="No available menu items for this restaurant yet."
      />
    </div>
  );
}
