import { BRAND } from "@/lib/brand";
import type { RestaurantEmailSampleId } from "@/lib/sales-kit/email-samples";

export type RestaurantProspectId = "default";

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

const DEFAULT_WHY_WIN: ProspectBullet[] = [
  {
    title: "Repeat office demand",
    body: "Companies on rotation week after week—not one-off catering luck.",
  },
  {
    title: "Headcount before prep",
    body: "Customers order ahead; one order list after ordering closes so the kitchen knows what to make.",
  },
  {
    title: "You deliver",
    body: "We handle ordering and payment; you prepare, label, and deliver on time.",
  },
  {
    title: "Your brand",
    body: "Logo and menu on the customer order screen.",
  },
  {
    title: "Weekly visibility",
    body: "Weekly payout summary—details covered in onboarding.",
  },
];

export function getRestaurantProspectContent(
  _prospectId: RestaurantProspectId = "default"
): RestaurantProspectContent {
  return {
    id: "default",
    label: "General restaurant",
    packetTitle: "Restaurant partner packet",
    oneSheetPdfName: "groupmeals-restaurant-one-sheet.pdf",
    coverEyebrow: "Partner overview",
    coverHeadline: "Grow weekday lunch revenue — without adding delivery-app chaos",
    coverSubhead: `${BRAND.name} puts recurring corporate lunch on your calendar: customers order ahead, you get one clean order list, you prepare and deliver—we handle payments and reminders.`,
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
    whyWinBullets: DEFAULT_WHY_WIN,
    showCateringSection: false,
    emailSamples: null,
  };
}
