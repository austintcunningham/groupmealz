"use client";

import { useMemo } from "react";
import { filterCustomerFacingMenu } from "@/components/order/CustomerOrderMenu";
import { DraggableCustomerMenuPreview } from "@/components/restaurant/DraggableCustomerMenuPreview";
import type { MenuCategory, MenuItem } from "@/types/database";

export function CustomerMenuLivePreview({
  categories,
  menuItems,
  restaurantName,
}: {
  categories: MenuCategory[];
  menuItems: MenuItem[];
  restaurantName: string;
}) {
  const { categories: visibleCats, menuItems: visibleItems } = useMemo(
    () => filterCustomerFacingMenu(categories, menuItems),
    [categories, menuItems]
  );

  return (
    <section className="rounded-xl border-2 border-[var(--geaux-yellow)] bg-[var(--geaux-cream)] p-4">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Customer view (live preview)
        </p>
        <p className="text-sm text-slate-600">
          What offices see when ordering from <strong>{restaurantName}</strong>. Drag the{" "}
          <span className="inline-flex translate-y-0.5 flex-col gap-0.5 align-middle">
            <span className="block h-0.5 w-3 rounded-full bg-slate-400" />
            <span className="block h-0.5 w-3 rounded-full bg-slate-400" />
            <span className="block h-0.5 w-3 rounded-full bg-slate-400" />
          </span>{" "}
          handle to reorder categories and items — press and hold briefly, then drag. Sold-out items
          are hidden here but stay in the list below.
        </p>
      </div>
      <DraggableCustomerMenuPreview
        allCategories={categories}
        allMenuItems={menuItems}
        visibleCategories={visibleCats}
        visibleItems={visibleItems}
      />
    </section>
  );
}
