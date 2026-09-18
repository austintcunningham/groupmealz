import type { PlatformFeeType, PlatformSettings } from "@/types/database";

export interface FeeBreakdown {
  subtotalCents: number;
  entreeCount: number;
  taxCents: number;
  platformFeeCents: number;
  totalCents: number;
  payoutDueCents: number;
}

export function countEntrees(items: { quantity: number }[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function calculatePlatformFeeCents(
  subtotalCents: number,
  settings: Pick<
    PlatformSettings,
    "platform_fee_type" | "flat_fee_cents" | "percentage_bps"
  >,
  entreeCount: number
): number {
  const { platform_fee_type, flat_fee_cents, percentage_bps } = settings;
  const entrees = Math.max(0, entreeCount);

  switch (platform_fee_type as PlatformFeeType) {
    case "per_entree":
      return flat_fee_cents * entrees;
    case "flat":
      return flat_fee_cents;
    case "percentage":
      return Math.round((subtotalCents * percentage_bps) / 10000);
    case "hybrid":
      return flat_fee_cents + Math.round((subtotalCents * percentage_bps) / 10000);
    default:
      return flat_fee_cents * entrees;
  }
}

export function calculateTaxCents(
  subtotalCents: number,
  salesTaxBps: number
): number {
  return Math.round((subtotalCents * salesTaxBps) / 10000);
}

export function calculateOrderTotals(
  subtotalCents: number,
  settings: Pick<
    PlatformSettings,
    "platform_fee_type" | "flat_fee_cents" | "percentage_bps" | "sales_tax_bps"
  >,
  entreeCount: number
): FeeBreakdown {
  const taxCents = calculateTaxCents(subtotalCents, settings.sales_tax_bps);
  const platformFeeCents = calculatePlatformFeeCents(subtotalCents, settings, entreeCount);
  const totalCents = subtotalCents + taxCents + platformFeeCents;
  const payoutDueCents = Math.max(0, subtotalCents + taxCents - platformFeeCents);

  return {
    subtotalCents,
    entreeCount,
    taxCents,
    platformFeeCents,
    totalCents,
    payoutDueCents,
  };
}

/** Customer-facing label for the service fee line in cart / checkout. */
export function serviceFeeLabel(
  settings: Pick<
    PlatformSettings,
    "platform_fee_type" | "flat_fee_cents" | "percentage_bps"
  >,
  entreeCount: number
): string {
  const { platform_fee_type, flat_fee_cents, percentage_bps } = settings;

  switch (platform_fee_type as PlatformFeeType) {
    case "per_entree": {
      const n = Math.max(0, entreeCount);
      const unit = (flat_fee_cents / 100).toFixed(2);
      return `Service fee ($${unit} × ${n} entrée${n === 1 ? "" : "s"})`;
    }
    case "flat":
      return "Service fee (per order)";
    case "percentage":
      return `Service fee (${(percentage_bps / 100).toFixed(2)}% of food)`;
    case "hybrid":
      return `Service fee ($${(flat_fee_cents / 100).toFixed(2)} + ${(percentage_bps / 100).toFixed(2)}%)`;
    default:
      return "Service fee";
  }
}
