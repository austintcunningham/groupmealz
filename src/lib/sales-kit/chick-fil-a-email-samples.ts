import { calculateRestaurantCommissionCents } from "@/lib/fees/calculate";
import { buildRestaurantFulfillmentHtml } from "@/lib/email/printable-order-digest";
import { buildRestaurantWeeklyPayoutHtml } from "@/lib/email/weekly-restaurant-html";
import { CHICK_FIL_A_GONZALES } from "@/lib/sales-kit/chick-fil-a-gonzales";

const { restaurantName, restaurantAddress, sampleOffice: office } = CHICK_FIL_A_GONZALES;

/** Office lunch rotation — individual meals only (separate from catering). */
export function chickFilASampleFulfillmentHtml(): string {
  return buildRestaurantFulfillmentHtml(
    {
      officeName: office.name,
      streetAddress: office.streetAddress,
      cityStateZip: office.cityStateZip,
      deliveryInstructions: "Individually labeled bags to break room. Call contact on arrival.",
      contactName: office.contactName,
      contactPhone: office.contactPhone,
      restaurantName,
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
    { sheetTitle: `Kitchen order sheet — ${restaurantName}` }
  );
}

/** Catering — separate lead time, own production sheet (not mixed with office lunch). */
export function chickFilASampleCateringProductionHtml(): string {
  return buildRestaurantFulfillmentHtml(
    {
      officeName: office.name,
      streetAddress: office.streetAddress,
      cityStateZip: office.cityStateZip,
      deliveryInstructions:
        "Deliver catering to conference wing; office admin meets at main reception.",
      contactName: office.contactName,
      contactPhone: office.contactPhone,
      restaurantName,
      lunchDate: "Thursday, October 15, 2026",
      deliveryAt: "11:30 AM",
      orders: [
        {
          orderId: "cfa-cater-0001-4000-8000-000000000001",
          placedAt: "10/10/2026 9:15:00 AM (ordered 5 days ahead)",
          customerName: "Jordan Ellis — office catering",
          customerEmail: "jordan.ellis@example.gov",
          customerNote: "Department all-hands — set up in Conference Room B.",
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
    { sheetTitle: `Catering production sheet — ${restaurantName}` }
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

  return buildRestaurantWeeklyPayoutHtml(
    {
      restaurantName,
      restaurantAddress,
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
    },
    { salesKitPreview: true }
  );
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
