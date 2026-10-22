import { BRAND } from "@/lib/brand";

export const CHICK_FIL_A_ONE_SHEET = {
  heroTitle:
    "Office lunch and corporate catering—scheduled ahead, prepaid, and kept off your noon rush.",
  heroSub: `${BRAND.name} helps you take corporate orders you can plan for: a recurring office lunch with a morning cutoff, and catering on a separate order with more lead time and its own kitchen email.`,
  banner:
    "Catering closes days before the event. Office lunch closes the morning of delivery. You use one partner portal, but each has its own checkout and its own email to the kitchen.",
  bullets: [
    {
      title: "Catering is separate",
      body: "Trays and platters go through the catering order only—not mixed with employee lunch orders.",
    },
    {
      title: "Big rotation days",
      body: "When you are Restaurant of the Day, expect 120–200+ labeled meals from one office, with a firm count before prep starts.",
    },
    {
      title: "Time to prep catering",
      body: "After catering closes, you get a production sheet with tray counts while there is still time to schedule staff and drivers.",
    },
    {
      title: "Paid online",
      body: "Customers pay at checkout. You deliver the food; we include both channels on your weekly settlement summary.",
    },
    {
      title: "Your menus",
      body: "Set catering packages and rotation-day meals separately, and update pricing when you need to.",
    },
    {
      title: "Clear fees",
      body: "12% commission on food subtotal only. Sales tax passes through on the stub for your records.",
    },
  ] as const,
  inbox: [
    {
      when: "Morning of office lunch",
      what: "Kitchen order list for labeled meals only, sent after that day’s cutoff.",
    },
    {
      when: "When catering closes",
      what: "Catering production sheet with tray counts, setup notes, and delivery time.",
    },
    {
      when: "Friday",
      what: "Weekly payout summary with office lunch and catering food sales together for accounting.",
    },
  ] as const,
  steps: [
    {
      n: "1",
      title: "Start with catering",
      body: "Load your catering menu and run one corporate event with enough lead time to prep.",
    },
    {
      n: "2",
      title: "Add office lunch",
      body: "When you are ready, turn on rotation-day lunch with its own cutoff and kitchen email.",
    },
    {
      n: "3",
      title: "Grow both",
      body: "Add offices on rotation and catering accounts as fulfillment stays consistent.",
    },
  ] as const,
  footerTitle: "Want to talk catering—or office lunch when the timing is right?",
};
