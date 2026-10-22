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
  coverEyebrow: "Prepared for Chick-fil-A — Gonzales (Hwy 30)",
  coverHeadline:
    "Two B2B channels — office lunch rotation and advance catering — both scheduled, both prepaid",
  coverSubhead: `${BRAND.name} brings corporate demand on calendars you can staff: recurring office lunch with next-day cutoff, and a separate catering path with longer lead times, its own rules, and production sheets sent well before the event — not mixed into the daily lunch rush.`,
  revenueLead:
    "High-volume stores need volume that does not collide with the noon dining room. We split the problem: office lunch rotation (120–200+ labeled meals on rotation days, short ordering window) and corporate catering (trays and platters on a separate order flow with advance notice). Both are prepaid B2B; they do not share cutoffs or the same kitchen email.",
  revenueStats: [
    {
      label: "Example office lunch day",
      value: "120–200+ meals",
      detail: "Restaurant of the Day on rotation — individual orders, morning cutoff",
    },
    {
      label: "Example catering drop",
      value: "$800–$2,500+",
      detail: "Single corporate event — ordered days ahead on the catering flow",
    },
    {
      label: "Illustrative rotation week",
      value: "$9,500–$22,000",
      detail: "Office lunch food only; catering booked on its own schedule adds on top",
    },
  ],
  revenueFootnote:
    "Illustration only — Gonzales / Ascension market. Office lunch and catering use different ordering rules and time windows — designed so catering prep does not land on the same timeline as rotation-day lunch counts.",
  showCateringSection: true,
  emailSamples: [
    {
      id: "daily-kitchen",
      title: "Office lunch — daily kitchen order list",
      when: "Morning of lunch (9:30 AM Central) after that day’s ordering closes",
      pitch:
        "Rotation-day run sheet: individual meals, modifiers, delivery window, and office contact — not combined with catering orders.",
    },
    {
      id: "catering-production",
      title: "Catering — production sheet",
      when: "After catering cutoff (typically several days before delivery)",
      pitch:
        "Separate email when an office’s catering order locks: tray counts, setup notes, delivery date/time, and contact — sent with enough lead time to schedule prep and drivers.",
    },
    {
      id: "weekly-payout",
      title: "Weekly payout estimate",
      when: "Friday afternoon (Mon–Fri settlement period)",
      pitch:
        "Check stub combining office lunch and catering food sales for the week — 600 sample meal-equivalent volume on the office side, plus catering in settlement.",
    },
  ],
  whyWinBullets: [
    {
      title: "Catering on its own rails",
      body: "Corporate trays and platters use a separate order process, cutoff, and kitchen email — not checkout with rotation-day lunch.",
    },
    {
      title: "Advance time for catering prep",
      body: "Catering orders lock days before delivery so your team can batch trays without touching the office-lunch timeline.",
    },
    {
      title: "Office lunch at scale",
      body: "120–200+ meals on rotation days with a firm morning headcount — production you can plan beside (not inside) walk-in peak.",
    },
    {
      title: "Off the in-store rush",
      body: "Both channels are placed ahead of service; delivery windows are published up front.",
    },
    {
      title: "Your menus in the portal",
      body: "Configure rotation-day meals and catering packages independently — pricing and availability on your terms.",
    },
    {
      title: "Weekly settlement",
      body: "One payout summary for accounting — office lunch and catering food sales, tax pass-through, and commission on food subtotal only.",
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
