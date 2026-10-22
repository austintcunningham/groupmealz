import { BRAND } from "@/lib/brand";
import { CHICK_FIL_A_MAIN_HEADLINE } from "@/lib/sales-kit/restaurant-prospect-variants";

export const CHICK_FIL_A_ONE_SHEET = {
  heroTitle: CHICK_FIL_A_MAIN_HEADLINE,
  heroSub: `${BRAND.name} puts corporate lunch and catering on your calendar—prepaid, scheduled, and sized for stores that are already busy at noon.`,
  banner:
    "Two ways offices buy from you: rotation-day lunch for the building, and advance catering for meetings—both through GroupMeals.",
  bullets: [
    {
      title: "Catering first",
      body: "Corporate trays and platters on their own order path—good way to open the door with a store that already knows catering.",
    },
    {
      title: "Big rotation days",
      body: "When you are Restaurant of the Day, think 120–200+ labeled meals from one office—not a handful of walk-ins.",
    },
    {
      title: "Planned ahead",
      body: "Offices order on a schedule so your team can staff prep and delivery before the rush.",
    },
    {
      title: "Paid upfront",
      body: "No payment at the door. You cook, deliver, and get a weekly payout summary.",
    },
    {
      title: "Your brand",
      body: "Your menu and look on the order screen—not a generic marketplace.",
    },
  ] as const,
  inbox: [
    {
      when: "Office lunch days",
      what: "Kitchen order list with names, items, and delivery details.",
    },
    {
      when: "Catering jobs",
      what: "Production sheet with tray counts and setup notes.",
    },
    {
      when: "Each week",
      what: "Weekly payout summary.",
    },
  ] as const,
  steps: [
    {
      n: "1",
      title: "Conversation",
      body: "We align on catering, timing, and what a good first office looks like.",
    },
    {
      n: "2",
      title: "Pilot",
      body: "One corporate event or rotation day with onboarding support.",
    },
    {
      n: "3",
      title: "Grow",
      body: "More offices and catering accounts as fulfillment stays smooth.",
    },
  ] as const,
  footerTitle: "Let's talk about catering—or office lunch when you're ready.",
};
