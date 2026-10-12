import { isPromoActive } from "@/lib/menus/effective-price";
import { formatCents } from "@/lib/money/format";
import type { MenuItem } from "@/types/database";

/** Customer-facing price — promo shows original (struck), deal price, and optional label. */
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

  if (promo) {
    return (
      <div className={className}>
        <p>
          <span className="text-slate-500 line-through">{formatCents(item.price_cents)}</span>{" "}
          <span className="font-medium text-red-600">{formatCents(priceCents)}</span>
        </p>
        {item.promo_label ? (
          <p className="mt-0.5 text-xs font-normal text-green-800">{item.promo_label}</p>
        ) : null}
      </div>
    );
  }

  return (
    <p className={className}>
      <span className="font-medium text-red-600">{formatCents(priceCents)}</span>
    </p>
  );
}
