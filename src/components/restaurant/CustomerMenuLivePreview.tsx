"use client";

import { useMemo } from "react";
import {
  CustomerOrderMenu,
  filterCustomerFacingMenu,
} from "@/components/order/CustomerOrderMenu";
import type { MenuCategory, MenuItem } from "@/types/database";

export function CustomerMenuLivePreview({
  categories,
  menuItems,
  restaurantName,
  serviceFeePerEntreeCents = 250,
}: {
  categories: MenuCategory[];
  menuItems: MenuItem[];
  restaurantName: string;
  serviceFeePerEntreeCents?: number;
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
          What offices see when ordering from <strong>{restaurantName}</strong> — only{" "}
          <strong>available</strong> items, in the same order as below, with uploaded photos shown
          after you pick a file. Sold-out items are omitted here.
        </p>
      </div>
      <div className="max-h-[min(70vh,520px)] overflow-y-auto rounded-lg border border-slate-200 bg-white p-3">
        <CustomerOrderMenu
          categories={visibleCats}
          menuItems={visibleItems}
          serviceFeePerEntree={serviceFeePerEntreeCents}
          interactive={false}
          emptyMessage="No available items yet — add categories and mark items as Available."
        />
      </div>
    </section>
  );
}
