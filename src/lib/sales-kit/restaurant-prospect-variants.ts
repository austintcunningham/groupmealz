import { BRAND } from "@/lib/brand";
import type { RestaurantEmailSampleId } from "@/lib/sales-kit/email-samples";

export type RestaurantProspectId = "default" | "chick-fil-a";

export type ProspectBullet = { title: string; body: string };

export type RestaurantProspectContent = {
  id: RestaurantProspectId;
  label: string;
  packetTitle: string;
  oneSheetPdfName: string;
  coverEyebrow: string;
  coverHeadline: string;
  coverSubhead: string;
  revenueLead: string;
  revenueStats: { label: string; value: string; detail: string }[];
  revenueFootnote: string;
  whyWinBullets: ProspectBullet[];
  showCateringSection: boolean;
  emailSamples: {
    id: RestaurantEmailSampleId;
    title: string;
    when: string;
    pitch: string;
  }[] | null;
};

export const CHICK_FIL_A_PROSPECT: RestaurantProspectContent = {
  id: "chick-fil-a",
  label: "Chick-fil-A",
  packetTitle: "Chick-fil-A partner packet",
  oneSheetPdfName: "groupmeals-chick-fil-a-one-sheet.pdf",
  coverEyebrow: "Prepared for Chick-fil-A operators",
  coverHeadline:
    "Corporate catering & office lunch — scheduled volume that respects your lunch rush",
  coverSubhead: `${BRAND.name} routes prepaid B2B demand through one portal: employees order ahead, offices can add catering trays and platters, and your team gets a single cutoff-based manifest — production and delivery windows you can staff for, not surprise spikes at noon.`,
  revenueLead:
    "You are not looking for another 30 lunch rushes hidden inside the dining room line. You are looking for large, scheduled corporate drops — catering trays plus individually labeled meals — with a firm headcount before production starts. That is the volume profile we bring: offices on rotation, participation that scales with building size, and catering SKUs alongside à la carte meals.",
  revenueStats: [
    {
      label: "Example office day",
      value: "120–200+ meals",
      detail: "One campus or tower when you are Restaurant of the Day — plus optional catering trays",
    },
    {
      label: "Avg ticket",
      value: "$12–$16",
      detail: "Meals and catering items at your menu pricing — update anytime in the portal",
    },
    {
      label: "Illustrative rotation week",
      value: "$9,500–$22,000",
      detail: "120–200 people × 5 days × ticket (food only); multiple offices multiply this",
    },
  ],
  revenueFootnote:
    "Illustration only — Baton Rouge–style corporate participation. Catering tray lines on the same manifest can add meaningful ticket lift without adding register chaos.",
  showCateringSection: true,
  emailSamples: [
    {
      id: "daily-kitchen",
      title: "Daily kitchen, catering & order list email",
      when: "Every lunch morning (9:30 AM Central) after ordering closes",
      pitch:
        "One run sheet: individual meals, modifiers, tray counts (nuggets, strips, sandwich platters), delivery window, and office contact — batch for catering and line prep separately.",
    },
    {
      id: "weekly-payout",
      title: "Weekly payout estimate",
      when: "Friday afternoon (Mon–Fri lunches)",
      pitch:
        "Check stub with 600 sample orders: food subtotal, tax, 12% commission on food only, and check total — sized for a high-participation corporate week.",
    },
  ],
  whyWinBullets: [
    {
      title: "Catering-native ordering",
      body: "Offices add Chick-fil-A catering trays and platters on the same order flow as individual meals — prepaid, with counts locked at cutoff.",
    },
    {
      title: "Volume you can schedule",
      body: "Final headcount and tray totals land before the lunch day — staff catering prep and delivery runs without guessing at 10:45 AM.",
    },
    {
      title: "Off the in-store rush",
      body: "Corporate orders are placed days ahead; production is tied to a delivery window, not competing with walk-in peak.",
    },
    {
      title: "Your menu & catering SKUs",
      body: "Sandwich meals, nuggets, strips, salads, and catering packages — you control what is offered to offices in the portal.",
    },
    {
      title: "One manifest, one delivery",
      body: "Labeled bags for individuals plus sealed catering containers — one driver handoff, one office contact on the sheet.",
    },
    {
      title: "Weekly settlement",
      body: "Payout-style summaries that separate food, tax pass-through, and commission — built for franchise accounting rhythm.",
    },
    {
      title: "Transparent economics",
      body: "12% commission on food subtotal only — tax set aside for pass-through; no commission on tax, tips, or service fees.",
    },
  ],
};

const DEFAULT_WHY_WIN: ProspectBullet[] = [
  {
    title: "Predictable batches",
    body: "Final headcount lands at cutoff; you produce from the order list instead of guessing.",
  },
  {
    title: "You deliver",
    body: "We email the final order list; you prepare, label bags, and handle timely delivery to the office.",
  },
  {
    title: "Corporate discovery",
    body: "New offices meet you on our lunch rotation, not a one-off Groupon rush.",
  },
  {
    title: "Your brand on the order screen",
    body: "Logo and menu presentation that feels like your restaurant, not a generic marketplace.",
  },
  {
    title: "Operations that respect the kitchen",
    body: "Printable digests, modifiers spelled out, one contact email for fulfillment.",
  },
  {
    title: "Settlement visibility",
    body: "Weekly payout-style summaries so accounting knows what is coming.",
  },
  {
    title: "Transparent economics",
    body: "12% commission on food subtotal only — tax is set aside first, then commission; tax is settled to you for remittance.",
  },
];

export function getRestaurantProspectContent(
  prospectId: RestaurantProspectId = "default"
): RestaurantProspectContent {
  if (prospectId === "chick-fil-a") {
    return CHICK_FIL_A_PROSPECT;
  }

  return {
    id: "default",
    label: "General restaurant",
    packetTitle: "Restaurant partner packet",
    oneSheetPdfName: "groupmeals-restaurant-one-sheet.pdf",
    coverEyebrow: "Partner overview",
    coverHeadline: "Grow weekday lunch revenue — without adding delivery-app chaos",
    coverSubhead: `${BRAND.name} puts recurring corporate lunch on your calendar: employees order days ahead, you get one clean order list email every morning, you prepare and deliver — we handle payments, reminders, and satisfaction tracking.`,
    revenueLead:
      "Office lunch is not one big catering tray — it is dozens of individual meals, ordered on a deadline, delivered at the same window, week after week. That is high-margin repeat business if you can see it coming. GroupMeals puts that demand on your calendar instead of your phone ringing at 10:45 AM.",
    revenueStats: [
      {
        label: "Example order",
        value: "20–45 people",
        detail: "One office lunch day when you're on rotation",
      },
      {
        label: "Avg entrée",
        value: "$13–$16",
        detail: "Your menu, your pricing — update anytime in the portal",
      },
      {
        label: "Illustrative week",
        value: "$1,300–$3,600",
        detail: "20–45 people × 5 days × entrée (food only)",
      },
    ],
    revenueFootnote:
      "Illustration only — actual volume depends on office size, schedule, and participation. Multiple offices on rotation multiply this effect.",
    showCateringSection: false,
    emailSamples: null,
    whyWinBullets: DEFAULT_WHY_WIN,
  };
}
