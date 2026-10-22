import { calculateRestaurantCommissionCents } from "@/lib/fees/calculate";
import {
  buildRestaurantFulfillmentHtml,
  type DigestOrder,
} from "@/lib/email/printable-order-digest";
import { buildRestaurantWeeklyPayoutHtml } from "@/lib/email/weekly-restaurant-html";
import { CHICK_FIL_A_GONZALES } from "@/lib/sales-kit/chick-fil-a-gonzales";

const { restaurantName, restaurantAddress, sampleOffice: office } = CHICK_FIL_A_GONZALES;

const MEAL_LINES = [
  {
    name: "Chick-fil-A® Chicken Sandwich Meal",
    lineCents: 1249,
    specialInstructions: "no pickles",
  },
  { name: "Spicy Chicken Sandwich Meal", lineCents: 1249 },
  { name: "Grilled Chicken Sandwich Meal", lineCents: 1249 },
  { name: "Cobb Salad", lineCents: 1099, specialInstructions: "no bacon" },
  { name: "8 ct Nuggets Meal", lineCents: 1199 },
] as const;

const CUSTOMERS = [
  ["Paige", "Campbell"],
  ["Marcus", "Chen"],
  ["Jordan", "Ellis"],
  ["Sam", "Nguyen"],
  ["Taylor", "Brooks"],
  ["Riley", "Martinez"],
  ["Casey", "Dupont"],
  ["Morgan", "Lee"],
  ["Avery", "Johnson"],
  ["Quinn", "Washington"],
  ["Jamie", "Patel"],
  ["Drew", "Garcia"],
  ["Alex", "Thompson"],
  ["Blake", "Robinson"],
  ["Cameron", "Wilson"],
  ["Dakota", "Brown"],
  ["Emery", "Davis"],
  ["Finley", "Miller"],
] as const;

/** High-volume kitchen digest — same format as the default packet, more orders. */
export function chickFilASampleFulfillmentHtml(): string {
  const orders: DigestOrder[] = CUSTOMERS.map(([first, last], i) => {
    const meal = MEAL_LINES[i % MEAL_LINES.length]!;
    const subtotalCents = meal.lineCents;
    const taxCents = Math.round(subtotalCents * 0.105);
    return {
      orderId: `cfa-meal-${String(i + 1).padStart(4, "0")}-4000-8000-000000000000`,
      placedAt: `10/12/2026 ${7 + (i % 3)}:${String(10 + (i % 50)).padStart(2, "0")}:00 AM`,
      customerName: `${first} ${last}`,
      customerEmail: `${first.toLowerCase()}.${last.toLowerCase()}@example.gov`,
      lines: [
        {
          name: meal.name,
          qty: 1,
          lineCents: meal.lineCents,
          ...("specialInstructions" in meal && meal.specialInstructions
            ? { specialInstructions: meal.specialInstructions }
            : {}),
        },
      ],
      subtotalCents,
      taxCents,
      totalCents: subtotalCents + taxCents,
    };
  });

  return buildRestaurantFulfillmentHtml({
    officeName: office.name,
    streetAddress: office.streetAddress,
    cityStateZip: office.cityStateZip,
    deliveryInstructions: "Individually labeled bags to break room. Call contact on arrival.",
    contactName: office.contactName,
    contactPhone: office.contactPhone,
    restaurantName,
    lunchDate: "Tuesday, October 13, 2026",
    deliveryAt: "11:45 AM",
    orders,
  });
}

/** High-volume week sample — inflated vs default restaurant packet (150 → 600 orders). */
export function chickFilASampleWeeklyPayoutHtml(): string {
  const subtotalCents = 1_080_000;
  const gratuityCents = 0;
  const taxCents = 113_400;
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
