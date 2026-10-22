/** Internal onboarding checklist for GroupMeals onboarding specialists. */

export type OnboardingChecklistItem = {
  id: string;
  task: string;
  notes?: string;
  cateringFirstHint?: string;
  /** Admin or in-app link for the specialist */
  adminHref?: string;
  adminLabel?: string;
};

export type OnboardingChecklistPhase = {
  id: string;
  title: string;
  subtitle: string;
  /** Show when leading with catering (e.g. high-volume QSR) */
  cateringFirstHint?: string;
  items: OnboardingChecklistItem[];
};

export const RESTAURANT_ONBOARDING_CHECKLIST: OnboardingChecklistPhase[] = [
  {
    id: "prep",
    title: "Before kickoff",
    subtitle: "After verbal interest — before the first working session",
    items: [
      {
        id: "prep-send-leave-behind",
        task: "Send the right leave-behind (one-sheet or full packet)",
        notes:
          "Pitch materials stay high level. Do not front-load settlement, tax, or cutoff policy in the first email.",
        adminHref: "/admin/sales-kit",
        adminLabel: "Sales kit home",
      },
      {
        id: "prep-record-basics",
        task: "Record store name, address, GM/owner contact, and primary goal",
        notes: "Office lunch rotation, catering pilot, or both — and expected first-office geography.",
      },
      {
        id: "prep-calendar-kickoff",
        task: "Schedule kickoff (30–45 min) with whoever opens kitchen email and whoever signs off on menu pricing",
      },
      {
        id: "prep-office-pipeline",
        task: "Confirm at least one office or catering buyer in pipeline for the pilot",
        notes: "Partner confidence goes up when a real first date is on the horizon.",
        adminHref: "/admin/offices",
        adminLabel: "Offices",
      },
    ],
  },
  {
    id: "kickoff",
    title: "Kickoff call",
    subtitle: "Align expectations — this is where fine print belongs",
    items: [
      {
        id: "kickoff-channels",
        task: "Confirm revenue channels: office lunch rotation, catering, or both",
        notes:
          "Catering and office lunch use different order paths and kitchen emails. Never describe them as one combined checkout.",
        cateringFirstHint: "Many QSR partners start with one catering pilot, then add rotation days.",
      },
      {
        id: "kickoff-roles",
        task: "Assign roles: who opens the morning digest, labels bags, drives delivery, and handles 86’d items",
      },
      {
        id: "kickoff-no-partial",
        task: "Set expectation: no partial counts while employees order",
        notes:
          "Kitchen waits for the single post-cutoff email. Walk-ins asking “how many so far?” are not authoritative.",
      },
      {
        id: "kickoff-timing",
        task: "Explain default timing (Central): ordering opens ~48h before cutoff; cutoff default 9:30 AM on lunch day; digest at cutoff",
        notes: "Document any market-specific overrides in your handoff notes to ops.",
        adminHref: "/admin/settings",
        adminLabel: "Platform settings",
      },
      {
        id: "kickoff-economics",
        task: "Cover partner economics in plain language",
        notes:
          "Menu prices they control; small service fee typically offset via menu adjustment; weekly summary; sales tax pass-through and their remittance responsibility.",
      },
      {
        id: "kickoff-delivery",
        task: "Confirm they deliver (not marketplace drivers) and prepaid — no payment at the door",
      },
    ],
  },
  {
    id: "platform",
    title: "Platform setup",
    subtitle: "Admin tasks — complete before menu dry run",
    items: [
      {
        id: "platform-create-restaurant",
        task: "Create restaurant record with slug and kitchen/payout email",
        notes: "One inbox for kitchen digests and weekly summaries unless you explicitly split catering later.",
        adminHref: "/admin/restaurants",
        adminLabel: "Restaurants",
      },
      {
        id: "platform-invite-manager",
        task: "Invite restaurant manager(s) to the portal",
        adminHref: "/admin/restaurants",
        adminLabel: "Assign manager invite",
      },
      {
        id: "platform-active",
        task: "Verify restaurant is active and contact email delivers (check spam on first test)",
        adminHref: "/admin/email-preview",
        adminLabel: "Email previews",
      },
      {
        id: "platform-menu-start",
        task: "Build menu categories, entrées, sizes, modifiers, and ingredients",
        notes: "Match kitchen ticket language. Flag items that need photos before go-live.",
        adminHref: "/admin/menus",
        adminLabel: "Menus",
      },
      {
        id: "platform-pricing",
        task: "Set menu prices with partner — include service-fee offset in the numbers they quote offices",
        adminHref: "/admin/menus",
        adminLabel: "Menus",
      },
      {
        id: "platform-branding",
        task: "Upload logo and banner (admin or manager submission → branding review)",
        adminHref: "/admin/branding",
        adminLabel: "Branding review",
      },
      {
        id: "platform-simulate",
        task: "Run order simulation — confirm cart, modifiers, and checkout copy",
        adminHref: "/admin/simulate-order",
        adminLabel: "Order simulation",
      },
      {
        id: "platform-customer-preview",
        task: "Share customer order preview link with partner if helpful",
        adminHref: "/admin/customer-order-preview",
        adminLabel: "Customer order preview",
      },
    ],
  },
  {
    id: "schedule",
    title: "Office & calendar",
    subtitle: "Only for office lunch rotation — skip or defer if catering-only pilot",
    items: [
      {
        id: "schedule-office",
        task: "Create or link pilot office (address, delivery notes, admin contact)",
        adminHref: "/admin/offices",
        adminLabel: "Offices",
      },
      {
        id: "schedule-template",
        task: "Add weekly rotation template (day, restaurant, cutoff, delivery time)",
        adminHref: "/admin/schedules",
        adminLabel: "Lunch calendar",
      },
      {
        id: "schedule-first-day",
        task: "Publish first rotation day on the calendar far enough out for employee ordering window",
        adminHref: "/admin/schedules",
        adminLabel: "Lunch calendar",
      },
      {
        id: "schedule-announce",
        task: "Coordinate office announcement / ordering link with office admin",
        adminHref: "/admin/announcements",
        adminLabel: "Announcements",
      },
    ],
  },
  {
    id: "training",
    title: "Partner training & dry run",
    subtitle: "Walk through real samples — not slides",
    items: [
      {
        id: "train-kitchen-email",
        task: "Review sample kitchen digest line-by-line (header, delivery notes, per-person mods)",
        adminHref: "/admin/sales-kit/restaurants",
        adminLabel: "Restaurant packet (email samples)",
      },
      {
        id: "train-labeling",
        task: "Agree labeling standard: full name on outer bag, mods on label when non-default",
        notes: "Use the operations guide below as the printed reference.",
      },
      {
        id: "train-weekly-stub",
        task: "Preview weekly sales summary stub and tie to Admin → Payouts",
        adminHref: "/admin/payouts",
        adminLabel: "Restaurant payouts",
      },
      {
        id: "train-portal",
        task: "Manager logs in: menu edits, production view, reports — whatever they will use day to day",
        notes: "Restaurant portal at /restaurant after invite accepted.",
      },
      {
        id: "train-escalation",
        task: "Share escalation path: late delivery, wrong meal, 86’d item — ops email and support",
      },
    ],
  },
  {
    id: "pilot",
    title: "Pilot day",
    subtitle: "Specialist or ops on standby",
    items: [
      {
        id: "pilot-standby",
        task: "Be available from cutoff through delivery window",
      },
      {
        id: "pilot-digest",
        task: "Confirm kitchen received digest at cutoff; spot-check count vs. bags packed",
      },
      {
        id: "pilot-delivery",
        task: "Confirm on-time arrival and labeled handoff with office contact",
      },
      {
        id: "pilot-debrief",
        task: "Same-day debrief with GM/kitchen lead: mods, timing, labeling, volume surprises",
      },
      {
        id: "pilot-reviews",
        task: "Watch review emails next day; flag patterns before the next rotation",
        adminHref: "/admin/reviews",
        adminLabel: "Reviews",
      },
    ],
  },
  {
    id: "post",
    title: "After pilot — steady state",
    subtitle: "First 2–4 weeks",
    items: [
      {
        id: "post-menu-tune",
        task: "Tune menu items, pricing, and modifiers from pilot feedback",
        adminHref: "/admin/menus",
        adminLabel: "Menus",
      },
      {
        id: "post-second-office",
        task: "Add second office or catering account when fulfillment is consistently clean",
      },
      {
        id: "post-payout-week",
        task: "After first full Mon–Fri week, reconcile weekly email with Admin → Payouts stub",
        adminHref: "/admin/payouts",
        adminLabel: "Restaurant payouts",
      },
      {
        id: "post-handoff",
        task: "Hand partner to account/ops rhythm; document any custom cutoff or routing in internal notes",
      },
      {
        id: "post-catering-expand",
        task: "If catering-first: schedule office lunch conversation once catering fulfillment is smooth",
        cateringFirstHint: "Do not rush rotation days before the store trusts the process.",
      },
    ],
  },
];
