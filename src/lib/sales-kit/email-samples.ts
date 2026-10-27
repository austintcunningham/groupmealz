import { sampleOrderConfirmationHtml } from "@/lib/email/order-confirmation-html";
import { sampleRestaurantFulfillmentHtml } from "@/lib/email/printable-order-digest";
import { sampleReviewRequestHtml } from "@/lib/email/review-request";
import { sampleRestaurantWeeklyPayoutHtml } from "@/lib/email/weekly-restaurant-html";
import { sampleOfficeWeeklySummaryHtml } from "@/lib/email/weekly-office-html";
import { buildOfficeFulfillmentHtml, type DigestOfficeBlock } from "@/lib/email/printable-order-digest";
import { loadFirehouseMenuDigestMeals } from "@/lib/sales-kit/order-preview-sample";
import type { RestaurantProspectId } from "@/lib/sales-kit/restaurant-prospect-variants";

export type RestaurantEmailSampleId = "daily-kitchen" | "weekly-payout";
export type OfficeEmailSampleId =
  | "customer-confirmation"
  | "office-delivery"
  | "review-invite"
  | "weekly-summary";

export function sampleOfficeDeliveryBlock(): DigestOfficeBlock {
  return {
    officeName: "Iberville Building",
    streetAddress: "627 N. 4th St.",
    cityStateZip: "Baton Rouge, LA 70802",
    deliveryInstructions: "Individually labeled bags; check in at front desk.",
    contactName: "Office admin",
    contactPhone: "(225) 555-0100",
    restaurantName: "Firehouse Subs Gonzales",
    lunchDate: "Monday, October 12, 2026",
    deliveryAt: "12:00 PM",
    orders: [
      {
        orderId: "2879739a-0000-4000-8000-000000000001",
        placedAt: "10/12/2026 7:16:07 AM",
        customerName: "Paige Campbell",
        customerEmail: "paige.campbell@example.com",
        lines: [
          {
            name: "Sub, Chips, & Drink — Combo",
            qty: 1,
            lineCents: 1369,
            specialInstructions: "no lettuce or tomato, please",
          },
        ],
        subtotalCents: 1399,
        taxCents: 147,
        totalCents: 1546,
      },
      {
        orderId: "2879739a-0000-4000-8000-000000000002",
        placedAt: "10/12/2026 8:02:41 AM",
        customerName: "Jordan Ellis",
        customerEmail: "jordan.ellis@example.com",
        lines: [
          {
            name: "Hook & Ladder — Medium",
            qty: 1,
            lineCents: 1099,
            specialInstructions: "extra pickles",
          },
        ],
        subtotalCents: 1099,
        taxCents: 115,
        totalCents: 1214,
      },
    ],
  };
}

export async function getRestaurantSalesKitEmailHtml(
  id: RestaurantEmailSampleId,
  prospectId: RestaurantProspectId = "default"
): Promise<string> {
  const inflatedVolume = prospectId === "chick-fil-a";
  switch (id) {
    case "daily-kitchen": {
      const meals = await loadFirehouseMenuDigestMeals();
      return sampleRestaurantFulfillmentHtml({
        inflatedVolume,
        meals: meals.length ? meals : undefined,
        restaurantName: "Firehouse Subs Gonzales",
      });
    }
    case "weekly-payout":
      return sampleRestaurantWeeklyPayoutHtml({ salesKitPreview: true, inflatedVolume });
  }
}

export function getOfficeSalesKitEmailHtml(id: OfficeEmailSampleId, appBase?: string): string {
  switch (id) {
    case "customer-confirmation":
      return sampleOrderConfirmationHtml({ omitLogo: true });
    case "office-delivery":
      return buildOfficeFulfillmentHtml(sampleOfficeDeliveryBlock());
    case "review-invite":
      return sampleReviewRequestHtml(appBase, { omitLogo: true });
    case "weekly-summary":
      return sampleOfficeWeeklySummaryHtml();
  }
}

export const RESTAURANT_EMAIL_SAMPLES: {
  id: RestaurantEmailSampleId;
  title: string;
  when: string;
  pitch: string;
}[] = [
  {
    id: "daily-kitchen",
    title: "Daily kitchen & order list email",
    when: "Every lunch morning (9:30 AM Central) after ordering closes",
    pitch:
      "Printer-friendly run sheet with headcount, modifiers, and delivery details for that lunch day.",
  },
  {
    id: "weekly-payout",
    title: "Weekly payout summary",
    when: "Friday afternoon",
    pitch: "Weekly payout summary.",
  },
];

export const OFFICE_EMAIL_SAMPLES: {
  id: OfficeEmailSampleId;
  title: string;
  when: string;
  pitch: string;
}[] = [
  {
    id: "customer-confirmation",
    title: "Order confirmation",
    when: "When they order",
    pitch:
      "Each customer receives an order confirmation email along with the set group delivery time.",
  },
  {
    id: "office-delivery",
    title: "Office order list",
    when: "Morning of lunch",
    pitch: "Your point person gets a list of who ordered — useful at the front desk.",
  },
  {
    id: "review-invite",
    title: "Review request",
    when: "After lunch",
    pitch: "A short review request so we can improve food quality and service.",
  },
  {
    id: "weekly-summary",
    title: "Weekly lunch summary",
    when: "End of the week",
    pitch: "Meals by day and restaurant.",
  },
];
