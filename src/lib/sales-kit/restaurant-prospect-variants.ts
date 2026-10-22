import { BRAND } from "@/lib/brand";
import type { RestaurantEmailSampleId } from "@/lib/sales-kit/email-samples";

export type RestaurantProspectId = "default" | "chick-fil-a";

export type ProspectBullet = { title: string; body: string };

/** Used on Chick-fil-A one-sheet only — not the partner packet. */
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

const DEFAULT_REVENUE_STATS: RestaurantProspectContent["revenueStats"] = [
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
];

/** Same copy as the general restaurant packet — higher volume numbers only. */
const CHICK_FIL_A_PACKET_REVENUE_STATS: RestaurantProspectContent["revenueStats"] = [
  {
    label: "Example order",
    value: "120–200+ people",
    detail: "One office lunch day on rotation",
  },
  {
    label: "Avg entrée",
    value: "$13–$16",
    detail: "Your menu, your pricing",
  },
  {
    label: "Illustrative week",
    value: "$9,500–$22,000",
    detail: "Example week on rotation (food only)",
  },
];

function buildDefaultRestaurantProspect(
  overrides: Partial<RestaurantProspectContent> & Pick<RestaurantProspectContent, "id" | "label" | "packetTitle" | "oneSheetPdfName">
): RestaurantProspectContent {
  return {
    coverEyebrow: "Partner overview",
    coverHeadline: "Grow weekday lunch revenue — without adding delivery-app chaos",
    coverSubhead: `${BRAND.name} puts recurring corporate lunch on your calendar: employees order ahead, you get one clean order list, you prepare and deliver—we handle payments and reminders.`,
    revenueLead:
      "Office lunch is dozens of individual meals on a deadline, same delivery window, week after week. That is repeat business when you can see it coming—not a phone call at 10:45 AM.",
    revenueStats: DEFAULT_REVENUE_STATS,
    revenueFootnote: "Illustration only—volume depends on office size and participation.",
    whyWinBullets: DEFAULT_WHY_WIN,
    showCateringSection: false,
    emailSamples: null,
    ...overrides,
  };
}

export const CHICK_FIL_A_PROSPECT: RestaurantProspectContent = buildDefaultRestaurantProspect({
  id: "chick-fil-a",
  label: "Chick-fil-A",
  packetTitle: "Chick-fil-A partner packet",
  oneSheetPdfName: "groupmeals-chick-fil-a-one-sheet.pdf",
  revenueStats: CHICK_FIL_A_PACKET_REVENUE_STATS,
});

export function getRestaurantProspectContent(
  prospectId: RestaurantProspectId = "default"
): RestaurantProspectContent {
  if (prospectId === "chick-fil-a") {
    return CHICK_FIL_A_PROSPECT;
  }

  return buildDefaultRestaurantProspect({
    id: "default",
    label: "General restaurant",
    packetTitle: "Restaurant partner packet",
    oneSheetPdfName: "groupmeals-restaurant-one-sheet.pdf",
  });
}
