import { BRAND } from "@/lib/brand";
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
  coverSubhead: `${BRAND.name} adds corporate catering and office lunch rotation—prepaid, scheduled, and kept separate in your kitchen workflow.`,
  revenueLead:
    "Offices order catering and rotation-day lunch through GroupMeals. You get clear production sheets and order lists instead of day-of phone chaos.",
  revenueStats: [
    {
      label: "Catering",
      value: "Corporate events",
      detail: "Advance orders with a production sheet",
    },
    {
      label: "Office lunch",
      value: "Rotation days",
      detail: "One kitchen list per lunch day",
    },
    {
      label: "Checkout",
      value: "Prepaid online",
      detail: "No payment at the door",
    },
  ],
  revenueFootnote: "",
  showCateringSection: true,
  emailSamples: [
    {
      id: "daily-kitchen",
      title: "Office lunch — kitchen order list",
      when: "Morning of a rotation lunch day",
      pitch: "Kitchen order list for that rotation day.",
    },
    {
      id: "catering-production",
      title: "Catering — production sheet",
      when: "When a catering order is confirmed",
      pitch: "Production sheet when catering is confirmed.",
    },
    {
      id: "weekly-payout",
      title: "Weekly payout summary",
      when: "Friday afternoon",
      pitch: "Weekly payout summary.",
    },
  ],
  whyWinBullets: [
    {
      title: "Two channels",
      body: "Catering and office lunch—separate paths and kitchen emails.",
    },
    {
      title: "Advance notice",
      body: "Lists and sheets when ordering closes, not guesswork during the rush.",
    },
    {
      title: "Prepaid",
      body: "Offices pay online; you focus on food and delivery.",
    },
    {
      title: "Your store",
      body: "Your menu and branding on the order screen.",
    },
  ],
};

const DEFAULT_WHY_WIN: ProspectBullet[] = [
  {
    title: "Repeat office demand",
    body: "Companies on rotation week after week—not one-off catering luck.",
  },
  {
    title: "Headcount before prep",
    body: "One order list after ordering closes so the kitchen knows what to make.",
  },
  {
    title: "You deliver",
    body: "We handle ordering and payment; you prepare, label, and deliver on time.",
  },
  {
    title: "Your brand",
    body: "Logo and menu on the employee order screen.",
  },
  {
    title: "Weekly visibility",
    body: "Weekly payout summary—details covered in onboarding.",
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
    coverSubhead: `${BRAND.name} puts recurring corporate lunch on your calendar: employees order ahead, you get one clean order list, you prepare and deliver—we handle payments and reminders.`,
    revenueLead:
      "Office lunch is dozens of individual meals on a deadline, same delivery window, week after week. That is repeat business when you can see it coming—not a phone call at 10:45 AM.",
    revenueStats: [
      {
        label: "Example order",
        value: "20–45 people",
        detail: "One office lunch day on rotation",
      },
      {
        label: "Avg entrée",
        value: "$13–$16",
        detail: "Your menu, your pricing",
      },
      {
        label: "Illustrative week",
        value: "$1,300–$3,600",
        detail: "Example week on rotation (food only)",
      },
    ],
    revenueFootnote: "Illustration only—volume depends on office size and participation.",
    showCateringSection: false,
    emailSamples: null,
    whyWinBullets: DEFAULT_WHY_WIN,
  };
}
