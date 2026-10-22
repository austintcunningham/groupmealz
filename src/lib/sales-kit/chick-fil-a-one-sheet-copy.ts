import { BRAND } from "@/lib/brand";

export const CHICK_FIL_A_ONE_SHEET = {
  heroTitle:
    "Scheduled corporate catering & office lunch — volume you can staff, not surprise noon spikes.",
  heroSub: `${BRAND.name} puts prepaid B2B orders on your calendar: catering trays, labeled individual meals, one cutoff, one manifest, one delivery window.`,
  banner:
    "Think of a recurring corporate catering drop — with locked headcount, tray totals, and production time before the dining room rush.",
  bullets: [
    {
      title: "Catering + meals in one flow",
      body: "Offices order nugget trays, platters, and individual meals together — all prepaid before cutoff.",
    },
    {
      title: "120–200+ meals per office day",
      body: "Rotation days sized for campus-style participation, not a handful of walk-ins.",
    },
    {
      title: "Batch before the rush",
      body: "Final counts hit your inbox after cutoff so catering prep and delivery runs are scheduled, not reactive.",
    },
    {
      title: "Already paid",
      body: "No card at the door — settlement on your weekly summary.",
    },
    {
      title: "Your catering menu in the portal",
      body: "Configure trays, meals, and pricing — including LTOs — without a marketplace gatekeeper.",
    },
    {
      title: "Franchise-friendly economics",
      body: "12% commission on food subtotal only; sales tax pass-through on the stub.",
    },
  ] as const,
  inbox: [
    {
      when: "Morning of lunch",
      what: "Kitchen & catering manifest — tray counts, labeled meals, mods, delivery window.",
    },
    {
      when: "Friday",
      what: "Weekly payout-style summary sized for high-participation corporate weeks.",
    },
    {
      when: "Portal",
      what: "Catering SKUs and individual menu — update pricing and availability anytime.",
    },
  ] as const,
  steps: [
    {
      n: "1",
      title: "Pilot one corporate route",
      body: "Onboarding loads catering packages + meal menu; you set delivery capacity.",
    },
    {
      n: "2",
      title: "Produce from one email",
      body: "Trays and bags from the same manifest; deliver on the published window.",
    },
    {
      n: "3",
      title: "Expand rotation",
      body: "Strong fulfillment → more offices → recurring catering revenue.",
    },
  ] as const,
  footerTitle: "Let's talk corporate catering & office rotation for your market.",
};
