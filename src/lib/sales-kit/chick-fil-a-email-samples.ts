import { calculateRestaurantCommissionCents } from "@/lib/fees/calculate";
import { buildRestaurantFulfillmentHtml } from "@/lib/email/printable-order-digest";
import { buildRestaurantWeeklyPayoutHtml } from "@/lib/email/weekly-restaurant-html";

/** Office lunch rotation — individual meals only (separate from catering). */
export function chickFilASampleFulfillmentHtml(): string {
  return buildRestaurantFulfillmentHtml(
    {
      officeName: "State Office Campus — Capitol Park",
      streetAddress: "627 N. 4th St.",
      cityStateZip: "Baton Rouge, LA 70802",
      deliveryInstructions: "Individually labeled bags to lobby desk. Call contact on arrival.",
      contactName: "Jordan Ellis",
      contactPhone: "(225) 555-0142",
      restaurantName: "Chick-fil-A — Siegen Lane",
      lunchDate: "Tuesday, October 13, 2026",
      deliveryAt: "11:45 AM",
      orders: [
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
    },
    { sheetTitle: "Kitchen order sheet — Chick-fil-A — Siegen Lane" }
  );
}

/** Catering — separate lead time, own production sheet (not mixed with office lunch). */
export function chickFilASampleCateringProductionHtml(): string {
  return buildRestaurantFulfillmentHtml(
    {
      officeName: "State Office Campus — Capitol Park",
      streetAddress: "627 N. 4th St.",
      cityStateZip: "Baton Rouge, LA 70802",
      deliveryInstructions:
        "Deliver to 3rd-floor conference center 3-A by 11:30 AM; office admin meets at loading dock.",
      contactName: "Jordan Ellis",
      contactPhone: "(225) 555-0142",
      restaurantName: "Chick-fil-A — Siegen Lane",
      lunchDate: "Thursday, October 15, 2026",
      deliveryAt: "11:30 AM",
      orders: [
        {
          orderId: "cfa-cater-0001-4000-8000-000000000001",
          placedAt: "10/10/2026 9:15:00 AM (ordered 5 days ahead)",
          customerName: "Jordan Ellis — office catering",
          customerEmail: "jordan.ellis@example.gov",
          customerNote: "All-hands — set up on side tables; include extra sauces.",
          lines: [
            {
              name: "Chick-n-Minis™ Tray",
              qty: 3,
              lineCents: 7800,
              sizeLabel: "40 count each",
            },
            {
              name: "Chick-fil-A® Nuggets Tray",
              qty: 2,
              lineCents: 8400,
              sizeLabel: "64 count each",
            },
            {
              name: "Ice Dream® Cups",
              qty: 1,
              lineCents: 1800,
              sizeLabel: "24 cups",
            },
          ],
          subtotalCents: 18000,
          taxCents: 1890,
          totalCents: 19890,
        },
      ],
    },
    { sheetTitle: "Catering production sheet — Chick-fil-A — Siegen Lane" }
  );
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

export type ChickFilAEmailSampleId = "daily-kitchen" | "catering-production" | "weekly-payout";

export function getChickFilASalesKitEmailHtml(id: ChickFilAEmailSampleId): string {
  switch (id) {
    case "daily-kitchen":
      return chickFilASampleFulfillmentHtml();
    case "catering-production":
      return chickFilASampleCateringProductionHtml();
    case "weekly-payout":
      return chickFilASampleWeeklyPayoutHtml();
  }
}
