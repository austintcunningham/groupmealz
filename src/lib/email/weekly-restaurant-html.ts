import { formatCents } from "@/lib/money/format";
import { BRAND } from "@/lib/brand";
import type { RestaurantCheckStub } from "@/lib/accounting/restaurant-settlement";
import { escapeHtml } from "@/lib/email/html-utils";
import { stubRow, wrapPrintableEmail } from "@/lib/email/weekly-printable";

export function buildRestaurantWeeklyPayoutHtml(stub: RestaurantCheckStub): string {
  const commissionPct = (stub.commissionBps / 100).toFixed(2);

  const body = `
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
      ${stubRow(`${BRAND.name} commission (${commissionPct}%)`, `−${formatCents(stub.commissionCents)}`)}
      ${stubRow("Est. card processing", `−${formatCents(stub.stripeFeeCents)}`)}
      ${stubRow("Check total", formatCents(stub.checkTotalCents), true)}
    </div>
    <p class="muted" style="margin-top:16px;">Work-week payout — paid orders with lunch dates Mon–Fri in this period (matches Admin → Payouts).</p>`;

  return wrapPrintableEmail(body);
}

export function sampleRestaurantWeeklyPayoutHtml(): string {
  return buildRestaurantWeeklyPayoutHtml({
    restaurantName: "Firehouse Subs Gonzales",
    restaurantAddress: "1234 W Main St, Gonzales, LA",
    period: {
      weekStart: "2026-10-06",
      weekEnd: "2026-10-10",
      label: "10/06/2026 – 10/10/2026 (Mon–Fri)",
    },
    orderCount: 87,
    subtotalCents: 125000,
    gratuityCents: 0,
    taxCents: 13125,
    deliveryCents: 0,
    grossSalesCents: 138125,
    commissionBps: 1000,
    commissionCents: 12500,
    stripeFeeCents: 4200,
    checkTotalCents: 121425,
  });
}
