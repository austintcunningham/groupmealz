import type { PlatformFeeType, PlatformSettings } from "@/types/database";

export interface FeeBreakdown {
  subtotalCents: number;
  taxCents: number;
  platformFeeCents: number;
  totalCents: number;
  payoutDueCents: number;
}

export function calculatePlatformFeeCents(
  subtotalCents: number,
  settings: Pick<
    PlatformSettings,
    "platform_fee_type" | "flat_fee_cents" | "percentage_bps"
  >
): number {
  const { platform_fee_type, flat_fee_cents, percentage_bps } = settings;

  switch (platform_fee_type as PlatformFeeType) {
    case "flat":
      return flat_fee_cents;
    case "percentage":
      return Math.round((subtotalCents * percentage_bps) / 10000);
    case "hybrid":
      return flat_fee_cents + Math.round((subtotalCents * percentage_bps) / 10000);
    default:
      return flat_fee_cents;
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
  >
): FeeBreakdown {
  const taxCents = calculateTaxCents(subtotalCents, settings.sales_tax_bps);
  const platformFeeCents = calculatePlatformFeeCents(subtotalCents, settings);
  const totalCents = subtotalCents + taxCents + platformFeeCents;
  const payoutDueCents = Math.max(0, subtotalCents + taxCents - platformFeeCents);

  return {
    subtotalCents,
    taxCents,
    platformFeeCents,
    totalCents,
    payoutDueCents,
  };
}
