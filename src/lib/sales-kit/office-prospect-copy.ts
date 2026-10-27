import { BRAND } from "@/lib/brand";

/** Shared office prospect copy — one-sheet and full packet stay in lockstep. */

export const OFFICE_PROSPECT = {
  eyebrow: "For office teams",
  headline: "Office lunch from local restaurants — without the midday scramble.",
  subhead: `${BRAND.name} puts a weekly rotation of local favorites on your calendar. Your team orders ahead, pays online, and lunch shows up labeled and on time — so nobody is juggling group orders in chat.`,
  banner:
    "Real restaurants nearby. Individually paid, bagged & labeled meals that land when you need them.",
  whyHeading: "Why offices use us",
  whyBullets: [
    {
      title: "Local restaurants",
      body: "Places your team already enjoys — not a national ghost kitchen or mystery bag.",
    },
    {
      title: "Easy Ordering",
      body: "Everyone uses the website link to individually order their meal.",
    },
    {
      title: "Paid online",
      body: "No cash at the door, no shared cards, no collecting receipts after the fact.",
    },
    {
      title: "Labeled delivery",
      body: "Individually sealed bags show up for quick grab-and-go, not a pile of unmarked boxes.",
    },
    {
      title: "Feedback that matters",
      body: "After lunch, each person can leave a short rating on that specific meal. We use it to catch issues early and push restaurants to improve food and service the next time they are on your rotation.",
    },
  ],
  teamHeading: "What your team gets",
  teamRows: [
    {
      when: "When they order",
      what: "Each customer receives an order confirmation email along with the set group delivery time.",
    },
    {
      when: "Morning of lunch",
      what: "Your point person gets a list of who ordered — useful at the front desk.",
    },
    {
      when: "After lunch",
      what: "A short review request so we can improve food quality and service.",
    },
  ],
  steps: [
    {
      n: "1",
      title: "Tell us about your office",
      body: "Building address, delivery notes, and who should get the order list.",
    },
    {
      n: "2",
      title: "Share your order link",
      body: "We set up the page and a rotation of local restaurants for the week.",
    },
    {
      n: "3",
      title: "Lunch runs itself",
      body: "Your team orders, kitchens prep, individually bagged & labeled with name orders arrive — you stay out of the middle.",
    },
  ],
  footerTitle: "Ready for a quieter lunch hour? Let's plan your first week.",
} as const;
