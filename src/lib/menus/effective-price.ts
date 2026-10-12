import type { MenuItem } from "@/types/database";

type PricedItem = Pick<
  MenuItem,
  "price_cents" | "promo_price_cents" | "promo_ends_at" | "promo_label"
>;

/** Price charged for a lunch date (defaults to today). */
export function effectivePriceCents(
  item: PricedItem,
  lunchDateIso?: string
): number {
  if (item.promo_price_cents == null) return item.price_cents;
  const day = lunchDateIso ?? new Date().toISOString().slice(0, 10);
  if (item.promo_ends_at && day > item.promo_ends_at) return item.price_cents;
  return item.promo_price_cents;
}

export function isPromoActive(item: PricedItem, lunchDateIso?: string): boolean {
  return effectivePriceCents(item, lunchDateIso) !== item.price_cents;
}
