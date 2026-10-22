import { BRAND } from "@/lib/brand";
import { sampleOrderConfirmationHtml } from "@/lib/email/order-confirmation-html";
import { sampleRestaurantFulfillmentHtml } from "@/lib/email/printable-order-digest";
import { sampleReviewRequestHtml } from "@/lib/email/review-request";
import { sampleRestaurantWeeklyPayoutHtml } from "@/lib/email/weekly-restaurant-html";
import { sampleOfficeWeeklySummaryHtml } from "@/lib/email/weekly-office-html";
import { buildOfficeFulfillmentHtml, type DigestOfficeBlock } from "@/lib/email/printable-order-digest";
import { getChickFilASalesKitEmailHtml } from "@/lib/sales-kit/chick-fil-a-email-samples";
import type { RestaurantProspectId } from "@/lib/sales-kit/restaurant-prospect-variants";

export type RestaurantEmailSampleId =
  | "daily-kitchen"
  | "weekly-payout"
  | "catering-production";
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
    ],
  };
}

export function getRestaurantSalesKitEmailHtml(
  id: RestaurantEmailSampleId,
  prospectId: RestaurantProspectId = "default"
): string {
  if (prospectId === "chick-fil-a") {
    if (id === "catering-production") {
      return getChickFilASalesKitEmailHtml("catering-production");
    }
    return getChickFilASalesKitEmailHtml(id === "weekly-payout" ? "weekly-payout" : "daily-kitchen");
  }
  switch (id) {
    case "daily-kitchen":
      return sampleRestaurantFulfillmentHtml();
    case "weekly-payout":
      return sampleRestaurantWeeklyPayoutHtml();
    case "catering-production":
      throw new Error("catering-production sample is only available for chick-fil-a prospect");
  }
}

export function getOfficeSalesKitEmailHtml(id: OfficeEmailSampleId, appBase?: string): string {
  switch (id) {
    case "customer-confirmation":
      return sampleOrderConfirmationHtml();
    case "office-delivery":
      return buildOfficeFulfillmentHtml(sampleOfficeDeliveryBlock());
    case "review-invite":
      return sampleReviewRequestHtml(appBase);
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
      "One consolidated, printer-friendly run sheet: exact headcount, modifiers, delivery window, and office contact — so you batch production instead of guessing.",
  },
  {
    id: "weekly-payout",
    title: "Weekly payout estimate",
    when: "Friday afternoon (Mon–Fri lunches)",
    pitch:
      "Check stub with 150 sample orders: food subtotal, tax, 12% commission line, and check total — plus commission-base and sales tax footnotes for your accountant.",
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
    title: "Employee order confirmation",
    when: "Immediately after checkout",
    pitch:
      "Every teammate gets a branded receipt with items, pickup time, and restaurant — zero ‘did my order go through?’ Slack threads.",
  },
  {
    id: "office-delivery",
    title: "Office admin delivery digest",
    when: "Same morning as the restaurant (before delivery)",
    pitch:
      "Your point person sees who ordered, special instructions, and headcount — so reception and floor leads are never surprised.",
  },
  {
    id: "review-invite",
    title: "Post-lunch satisfaction survey",
    when: "~45 minutes after scheduled delivery",
    pitch:
      `We ask how lunch landed while it’s fresh — ratings flow to ${BRAND.name} and the restaurant so the next week gets better.`,
  },
  {
    id: "weekly-summary",
    title: "Weekly lunch summary",
    when: "Friday afternoon",
    pitch:
      "Meal counts by day and restaurant for the week — perfect for planning headcount, budgets, and ‘what did we eat?’ conversations.",
  },
];
