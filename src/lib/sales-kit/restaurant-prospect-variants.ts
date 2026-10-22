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
  coverSubhead: `${BRAND.name} helps busy stores add corporate lunch and catering revenue without treating both the same way. Offices order ahead, pay online, and you get clear production sheets—not last-minute phone chaos.`,
  revenueLead:
    "Think campus-scale office lunch when you are on rotation, plus corporate catering booked in advance. Both are prepaid B2B volume you can plan around instead of hiding inside the noon dining room rush.",
  revenueStats: [
    {
      label: "Example office lunch day",
      value: "120–200+ meals",
      detail: "One large office on rotation",
    },
    {
      label: "Example catering job",
      value: "$800–$2,500+",
      detail: "One corporate event",
    },
    {
      label: "Illustrative rotation week",
      value: "$9,500–$22,000",
      detail: "Office lunch illustration; catering adds on separately",
    },
  ],
  revenueFootnote: "Illustrative Gonzales / Ascension market—your onboarding specialist will size this for your trade area.",
  showCateringSection: true,
  emailSamples: [
    {
      id: "daily-kitchen",
      title: "Office lunch — kitchen order list",
      when: "Morning of a rotation lunch day",
      pitch: "Who ordered what, delivery window, and office contact—built for batching labeled meals.",
    },
    {
      id: "catering-production",
      title: "Catering — production sheet",
      when: "When a catering order is confirmed",
      pitch: "Tray counts and setup notes while there is still time to prep.",
    },
    {
      id: "weekly-payout",
      title: "Weekly sales summary",
      when: "Friday afternoon",
      pitch: "Snapshot of the week’s sales—the same kind of summary partners receive after go-live.",
    },
  ],
  whyWinBullets: [
    {
      title: "Catering as the opener",
      body: "Lead with trays and platters on a path built for advance corporate orders.",
    },
    {
      title: "Rotation-day scale",
      body: "Large offices on the calendar when you are Restaurant of the Day.",
    },
    {
      title: "Off the noon rush",
      body: "Demand shows up on a schedule, not as surprise walk-in pressure.",
    },
    {
      title: "Prepaid",
      body: "Offices pay online; you focus on food and delivery.",
    },
    {
      title: "Your menu, your look",
      body: "Branded order experience and items you control in the portal.",
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
    body: "Friday summary of what sold—details covered in onboarding.",
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
