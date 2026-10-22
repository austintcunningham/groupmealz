import { calculateRestaurantCommissionCents } from "@/lib/fees/calculate";
import { BRAND } from "@/lib/brand";
import { buildRestaurantFulfillmentHtml } from "@/lib/email/printable-order-digest";
import { buildRestaurantWeeklyPayoutHtml } from "@/lib/email/weekly-restaurant-html";

/** Sample kitchen email for Chick-fil-A prospect packet (includes catering line items). */
export function chickFilASampleFulfillmentHtml(): string {
  return buildRestaurantFulfillmentHtml({
    officeName: "State Office Campus — Capitol Park",
    streetAddress: "627 N. 4th St.",
    cityStateZip: "Baton Rouge, LA 70802",
    deliveryInstructions:
      "Catering to 3rd-floor conference center; labeled meals to lobby desk. Call contact on arrival.",
    contactName: "Jordan Ellis",
    contactPhone: "(225) 555-0142",
    restaurantName: "Chick-fil-A — Siegen Lane",
    lunchDate: "Tuesday, October 13, 2026",
    deliveryAt: "11:45 AM",
    orders: [
      {
        orderId: "cfa-cater-0001-4000-8000-000000000001",
        placedAt: "10/11/2026 2:04:11 PM",
        customerName: "Office admin (catering)",
        customerEmail: "jordan.ellis@example.gov",
        customerNote: "Team meeting — set up on side tables in 3-A.",
        lines: [
          {
            name: "Chick-n-Minis™ Tray",
            qty: 2,
            lineCents: 5200,
            sizeLabel: "40 count each",
          },
          {
            name: "Chick-fil-A® Nuggets Tray",
            qty: 1,
            lineCents: 4200,
            sizeLabel: "64 count",
          },
          {
            name: "Ice Dream® Cups",
            qty: 1,
            lineCents: 1800,
            sizeLabel: "24 cups",
          },
        ],
        subtotalCents: 11200,
        taxCents: 1176,
        totalCents: 12376,
      },
      {
        orderId: "cfa-meal-0002-4000-8000-000000000002",
        placedAt: "10/12/2026 8:22:03 AM",
        customerName: "Paige Campbell",
        customerEmail: "paige.campbell@example.gov",
        lines: [
          {
            name: "Chick-fil-A® Chicken Sandwich Meal",
            qty: 1,
            lineCents: 1249,
            specialInstructions: "no pickles",
          },
        ],
        subtotalCents: 1249,
        taxCents: 131,
        totalCents: 1380,
      },
      {
        orderId: "cfa-meal-0003-4000-8000-000000000003",
        placedAt: "10/12/2026 8:41:55 AM",
        customerName: "Marcus Chen",
        customerEmail: "marcus.chen@example.gov",
        lines: [
          {
            name: "Spicy Chicken Sandwich Meal",
            qty: 1,
            lineCents: 1249,
          },
        ],
        subtotalCents: 1249,
        taxCents: 131,
        totalCents: 1380,
      },
    ],
  });
}

/** High-volume week sample for Chick-fil-A prospect packet. */
export function chickFilASampleWeeklyPayoutHtml(): string {
  const subtotalCents = 1_128_000;
  const gratuityCents = 0;
  const taxCents = 118_440;
  const commissionBps = 1200;
  const commissionCents = calculateRestaurantCommissionCents(subtotalCents, commissionBps);
  const grossSalesCents = subtotalCents + taxCents + gratuityCents;
  const checkTotalCents = subtotalCents + taxCents + gratuityCents - commissionCents;

  return buildRestaurantWeeklyPayoutHtml({
    restaurantName: "Chick-fil-A — Siegen Lane",
    restaurantAddress: "6550 Siegen Ln, Baton Rouge, LA",
    period: {
      weekStart: "2026-10-06",
      weekEnd: "2026-10-10",
      label: "10/06/2026 – 10/10/2026 (Mon–Fri)",
    },
    orderCount: 600,
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

export function getChickFilASalesKitEmailHtml(
  id: "daily-kitchen" | "weekly-payout"
): string {
  switch (id) {
    case "daily-kitchen":
      return chickFilASampleFulfillmentHtml();
    case "weekly-payout":
      return chickFilASampleWeeklyPayoutHtml();
  }
}
