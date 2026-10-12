import { isPromoActive } from "@/lib/menus/effective-price";
import { formatCents } from "@/lib/money/format";
import type { MenuItem } from "@/types/database";

/** Customer-facing price line — promo shows deal price + label (no strikethrough). */
export function MenuItemPromoPrice({
  item,
  lunchDate,
  priceCents,
  className = "mt-1 text-sm",
}: {
  item: MenuItem;
  lunchDate?: string;
  priceCents: number;
  className?: string;
}) {
  const promo = isPromoActive(item, lunchDate);

  return (
    <p className={className}>
      <span className="font-medium text-red-600">{formatCents(priceCents)}</span>
      {promo && item.promo_label ? (
        <span className="mt-0.5 block text-xs font-normal text-green-800">{item.promo_label}</span>
      ) : null}
    </p>
  );
}
