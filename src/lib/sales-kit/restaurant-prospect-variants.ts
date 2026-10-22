import { BRAND } from "@/lib/brand";
import {
  RESTAURANT_PARTNER_FEE_BULLET,
  RESTAURANT_PARTNER_SERVICE_FEE_LINE,
} from "@/lib/partner/partner-fee-copy";
import type { RestaurantEmailSampleId } from "@/lib/sales-kit/email-samples";

export type RestaurantProspectId = "default" | "chick-fil-a";

export type ProspectBullet = { title: string; body: string };

export const CHICK_FIL_A_MAIN_HEADLINE =
  "One office lunch rotation + advanced catering — two different revenue channels to increase sales.";

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
  coverEyebrow: "",
  coverHeadline: CHICK_FIL_A_MAIN_HEADLINE,
  coverSubhead: `${BRAND.name} brings you corporate volume you can staff: office lunch on rotation with a morning cutoff, and catering on its own order with more notice, its own rules, and a production sheet before the event. The two are not mixed into one checkout or one kitchen email.`,
  revenueLead:
    "Busy stores do not need another surprise at noon. We offer two kinds of corporate business: office lunch on rotation (often 120–200+ labeled meals on a big day, with orders closing the morning of delivery) and catering (trays and platters ordered days ahead on a separate flow). Both are prepaid. Each has its own cutoff and its own email to the kitchen.",
  revenueStats: [
    {
      label: "Example office lunch day",
      value: "120–200+ meals",
      detail: "Restaurant of the Day on rotation—individual orders, morning cutoff",
    },
    {
      label: "Example catering job",
      value: "$800–$2,500+",
      detail: "One corporate event, ordered ahead on the catering flow",
    },
    {
      label: "Illustrative rotation week",
      value: "$9,500–$22,000",
      detail: "Office lunch food only; catering is booked and paid on its own schedule",
    },
  ],
  revenueFootnote:
    "Numbers are illustrative for the Gonzales / Ascension market. Catering and office lunch follow different rules and timelines so tray prep does not land on the same clock as rotation-day lunch counts.",
  showCateringSection: true,
  emailSamples: [
    {
      id: "daily-kitchen",
      title: "Office lunch — daily kitchen order list",
      when: "Morning of lunch (9:30 AM Central), after that day’s ordering closes",
      pitch:
        "Run sheet for rotation day: each meal, modifiers, delivery window, and office contact. Catering orders are not on this email.",
    },
    {
      id: "catering-production",
      title: "Catering — production sheet",
      when: "After catering closes (usually several days before delivery)",
      pitch:
        "Sent when the catering order is final: tray counts, setup notes, date, time, and contact—early enough to plan prep and delivery.",
    },
    {
      id: "weekly-payout",
      title: "Weekly payout estimate",
      when: "Friday afternoon (Mon–Fri settlement period)",
      pitch:
        "Check stub for the week’s food sales from office lunch and catering, with tax and service fee broken out (sample uses high office-lunch participation).",
    },
  ],
  whyWinBullets: [
    {
      title: "Catering stays separate",
      body: "Trays and platters use the catering order, cutoff, and kitchen email—not the rotation-day lunch checkout.",
    },
    {
      title: "Notice for catering",
      body: "Catering closes before the event so you can batch trays without waiting on the office-lunch timeline.",
    },
    {
      title: "Office lunch at scale",
      body: "Large rotation days with a firm morning headcount, so you can plan production around the dining room rush, not inside it.",
    },
    {
      title: "Orders placed ahead",
      body: "Offices order before the delivery window; you are not chasing last-minute phone requests.",
    },
    {
      title: "Menus in the portal",
      body: "Set rotation-day meals and catering packages separately, with pricing you control.",
    },
    {
      title: "Weekly settlement",
      body: "One summary for accounting with food from both programs and sales tax pass-through.",
    },
    {
      title: RESTAURANT_PARTNER_FEE_BULLET.title,
      body: RESTAURANT_PARTNER_FEE_BULLET.body,
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
    title: RESTAURANT_PARTNER_FEE_BULLET.title,
    body: `${RESTAURANT_PARTNER_SERVICE_FEE_LINE} Sales tax is set aside in settlement for you to remit.`,
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
