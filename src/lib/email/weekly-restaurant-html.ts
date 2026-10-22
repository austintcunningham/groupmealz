import { formatCents } from "@/lib/money/format";
import { BRAND } from "@/lib/brand";
import type { RestaurantCheckStub } from "@/lib/accounting/restaurant-settlement";
import { escapeHtml } from "@/lib/email/html-utils";
import {
  RESTAURANT_PARTNER_SERVICE_FEE_LINE,
  restaurantStubServiceFeeLabel,
} from "@/lib/partner/partner-fee-copy";
import { stubRow, wrapPrintableEmail } from "@/lib/email/weekly-printable";
import { calculateRestaurantCommissionCents } from "@/lib/fees/calculate";

export function buildRestaurantWeeklyPayoutHtml(stub: RestaurantCheckStub): string {
  const serviceFeeLabel = restaurantStubServiceFeeLabel();

  const body = `
    <div class="weekly-payout-stub">
      <div class="stub">
        <p class="muted" style="text-align:center;font-weight:bold;letter-spacing:0.08em;text-transform:uppercase;">${escapeHtml(BRAND.name)} check stub</p>
        <h1 style="text-align:center;margin:8px 0;">${escapeHtml(stub.restaurantName)}</h1>
        ${stub.restaurantAddress ? `<p class="muted" style="text-align:center;">${escapeHtml(stub.restaurantAddress)}</p>` : ""}
        <p class="muted" style="text-align:center;margin-top:8px;"><strong>Period:</strong> ${escapeHtml(stub.period.label)}</p>
        <hr class="rule" />
        ${stubRow("Restaurant of the Day orders", String(stub.orderCount), true)}
        <hr class="rule" />
        ${stubRow("Subtotal", formatCents(stub.subtotalCents))}
        ${stubRow("Tip / gratuity", formatCents(stub.gratuityCents))}
        ${stubRow("Delivery ($0.00)", formatCents(stub.deliveryCents))}
        ${stubRow("Tax", formatCents(stub.taxCents))}
        ${stubRow("Gross sales", formatCents(stub.grossSalesCents), true)}
        <hr class="rule" />
        ${stubRow(serviceFeeLabel, `−${formatCents(stub.commissionCents)}`)}
        ${stubRow("Check total", formatCents(stub.checkTotalCents), true)}
      </div>
    </div>
    <div class="weekly-payout-footnotes">
      <p class="muted" style="margin-top:12px;">Work-week payout — paid orders with lunch dates Mon–Fri in this period (matches Admin → Payouts).</p>
      <p class="muted" style="margin-top:6px;"><strong>Partner note:</strong> ${escapeHtml(RESTAURANT_PARTNER_SERVICE_FEE_LINE)} Sales tax is set aside for pass-through.</p>
      <p class="muted" style="margin-top:6px;"><strong>Check total:</strong> Food subtotal − service fee + tax (tax included in settlement for your remittance to tax authorities).</p>
    </div>`;

  return wrapPrintableEmail(body);
}

export function sampleRestaurantWeeklyPayoutHtml(): string {
  const subtotalCents = 270000;
  const gratuityCents = 0;
  const taxCents = 28350;
  const commissionBps = 1200;
  const commissionCents = calculateRestaurantCommissionCents(subtotalCents, commissionBps);
  const grossSalesCents = subtotalCents + taxCents + gratuityCents;
  const checkTotalCents = subtotalCents + taxCents + gratuityCents - commissionCents;

  return buildRestaurantWeeklyPayoutHtml({
    restaurantName: "Firehouse Subs Gonzales",
    restaurantAddress: "1234 W Main St, Gonzales, LA",
    period: {
      weekStart: "2026-10-06",
      weekEnd: "2026-10-10",
      label: "10/06/2026 – 10/10/2026 (Mon–Fri)",
    },
    orderCount: 150,
    subtotalCents,
    gratuityCents,
    taxCents,
    deliveryCents: 0,
    grossSalesCents,
    commissionBps,
    commissionCents,
    stripeFeeCents: 0,
    checkTotalCents,
  });
}
