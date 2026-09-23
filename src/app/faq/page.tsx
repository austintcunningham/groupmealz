import Link from "next/link";
import { BRAND } from "@/lib/brand";

const sections = [
  {
    title: "What is Group Meals?",
    body: `${BRAND.name} connects offices with local restaurants for organized “Restaurant of the Day” lunch delivery. Employees order online during a set window; the restaurant delivers one combined drop to your office — free delivery for the employer, no third-party driver app.`,
  },
  {
    title: "Is it safe to pay with a card?",
    body: "Yes. Checkout uses Stripe with industry-standard encryption. We never store full card numbers on our servers. You’ll get an email receipt after payment succeeds.",
  },
  {
    title: "How do I know my order went through?",
    body: "After you pay, you should receive a confirmation email. If it’s missing, check spam, then contact us with your name, office, and lunch date.",
  },
  {
    title: "Who do I contact about a problem with my order?",
    body: `Reply to your confirmation email or write ${BRAND.supportEmail} with your order details. We’ll work with the restaurant to fix issues when possible.`,
  },
  {
    title: "Can I cancel after ordering?",
    body: "Contact us as soon as possible. If the restaurant hasn’t started prep and the order window is still open, we may be able to cancel and refund. After cutoff, cancellations are usually not possible.",
  },
  {
    title: "Fees — what will I pay?",
    body: "Menu prices are set by the restaurant. Group Meals adds a service fee on each entrée (currently $2.50 per entrée quantity). Sides and drinks do not incur that fee unless marked as entrées. Tax and optional gratuity may apply. Your total is shown before you enter card details.",
  },
  {
    title: "Do I need an account?",
    body: "No account is required for most offices — use your company’s order link, enter your name and email, and pay. Some employers also offer staff logins for saved history.",
  },
  {
    title: "When can I order?",
    body: "Each lunch day has an order window (typically opening a few days ahead and closing before delivery). The order page shows open/closed status and cutoff time for the day you selected.",
  },
  {
    title: "Sign up my office",
    body: "Contact us to get your office onboarded with a custom order link and lunch calendar.",
  },
  {
    title: "Restaurants — join as a vendor",
    body: "Local restaurants can apply to be featured as Restaurant of the Day. You’ll receive production sheets, weekly payout summaries, and access to daily sales reports in your manager portal.",
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-[var(--geaux-cream)]">
      <header className="geaux-header-gradient text-white shadow-lg">
        <div className="geaux-accent-bar" />
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-6">
          <Link href="/login" className="text-lg font-black text-[var(--geaux-yellow)]">
            {BRAND.name}
          </Link>
          <Link href="/login" className="text-sm font-medium text-white/90 hover:text-[var(--geaux-yellow)]">
            Sign in
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-bold text-slate-900">FAQ</h1>
        <p className="mt-2 text-slate-600">
          Answers about ordering, fees, delivery, and getting your office or restaurant on {BRAND.name}.
        </p>
        <nav className="mt-8 rounded-xl border border-slate-200 bg-white p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">On this page</p>
          <ul className="space-y-1 text-sm">
            {sections.map((s) => (
              <li key={s.title}>
                <a href={`#${slug(s.title)}`} className="text-[var(--geaux-red)] hover:underline">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-10 space-y-10">
          {sections.map((s) => (
            <section key={s.title} id={slug(s.title)} className="scroll-mt-6">
              <h2 className="text-xl font-bold text-slate-900">{s.title}</h2>
              <p className="mt-3 leading-relaxed text-slate-700">{s.body}</p>
            </section>
          ))}
        </div>
        <div className="mt-12 rounded-xl border-2 border-[var(--geaux-yellow)] bg-white p-6 text-center">
          <p className="font-semibold text-slate-900">Still have questions?</p>
          <a
            href={`mailto:${BRAND.supportEmail}`}
            className="mt-2 inline-block text-[var(--geaux-red)] font-medium hover:underline"
          >
            {BRAND.supportEmail}
          </a>
        </div>
      </main>
    </div>
  );
}

function slug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}
