import { BRAND } from "@/lib/brand";

export const CHICK_FIL_A_ONE_SHEET = {
  heroTitle:
    "Office lunch rotation + advance catering — two prepaid channels, two sets of rules.",
  heroSub: `${BRAND.name} schedules B2B volume without blending it into your dining room rush: rotation-day lunches with a morning cutoff, and corporate catering on a separate order path with longer lead times and its own production sheet.`,
  banner:
    "Catering orders lock days ahead. Office lunch locks the morning of. Same partner portal — never the same checkout or kitchen email.",
  bullets: [
    {
      title: "Catering on its own flow",
      body: "Trays and platters only on the catering order process — not combined with employee lunch orders.",
    },
    {
      title: "120–200+ rotation-day meals",
      body: "Campus-scale office lunch when you are Restaurant of the Day — individual bags, short ordering window.",
    },
    {
      title: "Time to prep catering",
      body: "Production sheet after catering cutoff, typically days before delivery — staff before the event, not at noon.",
    },
    {
      title: "Already paid",
      body: "Both channels settle on your weekly summary — no card at the door.",
    },
    {
      title: "Menus you control",
      body: "Configure catering packages and rotation-day meals separately in the portal.",
    },
    {
      title: "Franchise-friendly economics",
      body: "12% commission on food subtotal only; sales tax pass-through on the stub.",
    },
  ] as const,
  inbox: [
    {
      when: "Office lunch morning",
      what: "Kitchen order list — labeled meals only, after that day’s cutoff.",
    },
    {
      when: "After catering cutoff",
      what: "Catering production sheet — tray counts and setup, sent with advance notice.",
    },
    {
      when: "Friday",
      what: "Weekly payout-style summary — office lunch + catering food sales combined for accounting.",
    },
  ] as const,
  steps: [
    {
      n: "1",
      title: "Pilot catering first",
      body: "Load catering SKUs; one corporate event with multi-day lead time.",
    },
    {
      n: "2",
      title: "Add office rotation",
      body: "When ready, turn on rotation-day lunch — separate cutoff and kitchen email.",
    },
    {
      n: "3",
      title: "Scale both",
      body: "More offices on lunch rotation; more catering accounts on the advance path.",
    },
  ] as const,
  footerTitle: "Let's talk corporate catering — and office rotation when you're ready.",
};
