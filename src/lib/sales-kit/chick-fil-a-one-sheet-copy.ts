import { BRAND } from "@/lib/brand";
import { CHICK_FIL_A_MAIN_HEADLINE } from "@/lib/sales-kit/restaurant-prospect-variants";

export const CHICK_FIL_A_ONE_SHEET = {
  heroTitle: CHICK_FIL_A_MAIN_HEADLINE,
  heroSub: `${BRAND.name} brings prepaid corporate catering and office lunch to your calendar—two channels, one partnership.`,
  banner:
    "Catering for meetings. Office lunch on rotation. Both order ahead through GroupMeals.",
  whyPartnerHeading: "Why operators choose to partner",
  bullets: [
    {
      title: "Two channels",
      body: "Catering and office lunch each have their own order path and kitchen email.",
    },
    {
      title: "Advance notice",
      body: "Production sheets and order lists arrive when ordering closes—not mid-rush guesswork.",
    },
    {
      title: "Prepaid",
      body: "Offices pay online. You cook, label, and deliver.",
    },
    {
      title: "Your store",
      body: "Your menu and branding on the customer order screen.",
    },
  ] as const,
  inbox: [
    {
      when: "Office lunch days",
      what: "Kitchen order list for that day.",
    },
    {
      when: "Catering",
      what: "Production sheet when the order is confirmed.",
    },
    {
      when: "Each week",
      what: "Weekly payout summary.",
    },
  ] as const,
  steps: [
    {
      n: "1",
      title: "Talk",
      body: "Align on catering, office lunch, and a pilot.",
    },
    {
      n: "2",
      title: "Pilot",
      body: "First event or rotation day with our team alongside yours.",
    },
    {
      n: "3",
      title: "Grow",
      body: "Add offices and events as fulfillment stays smooth.",
    },
  ] as const,
  footerTitle: "Let's talk catering—or office lunch when you're ready.",
};
