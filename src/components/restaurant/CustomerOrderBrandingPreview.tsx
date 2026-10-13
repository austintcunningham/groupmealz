"use client";

import { CustomerOrderRestaurantHero } from "@/components/order/CustomerOrderRestaurantHero";

export function CustomerOrderBrandingPreview({
  officeLabel = "Your office",
  restaurantName,
  logoUrl,
  bannerUrl,
  caption,
}: {
  officeLabel?: string;
  restaurantName: string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  caption?: string;
}) {
  const dateLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Customer order screen preview
      </p>
      {caption ? <p className="text-sm text-slate-600">{caption}</p> : null}
      <CustomerOrderRestaurantHero
        officeLabel={officeLabel}
        restaurantName={restaurantName}
        dateLabel={dateLabel}
        logoUrl={logoUrl}
        bannerUrl={bannerUrl}
      />
      <p className="text-xs text-slate-500">
        GroupMeals header above this block is platform branding; your logo and banner appear here on
        the order page.
      </p>
    </div>
  );
}
