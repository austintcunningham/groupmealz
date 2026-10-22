import { GroupMealsLogo } from "@/components/brand/GroupMealsLogo";
import { BRAND } from "@/lib/brand";

/**
 * Single-page leave-behind for restaurant prospects. Tuned for Print / Save PDF (US Letter).
 * Layout classes `one-sheet-grid-*` pair with globals.css so print matches desktop preview.
 */
export function RestaurantPartnerOneSheet() {
  return (
    <article className="restaurant-one-sheet mx-auto flex min-h-[11in] w-full max-w-[8.5in] flex-col bg-white text-[var(--geaux-charcoal)] shadow-lg">
      <header className="one-sheet-hero relative shrink-0 overflow-hidden geaux-header-gradient px-8 py-7 text-white">
        <div className="geaux-accent-bar" />
        <div className="flex items-start justify-between gap-5">
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/75">
              For restaurant partners
            </p>
            <h1 className="mt-2.5 text-[1.75rem] font-bold leading-[1.15] tracking-tight">
              Fill your lunch day with orders you can see coming — not last-minute chaos.
            </h1>
            <p className="mt-3 max-w-[34rem] text-[15px] leading-relaxed text-white/92">
              {BRAND.name} connects local offices to your kitchen: customers order ahead, pay online,
              and you get <strong className="text-white">one final order list</strong> every morning.
              Same window, labeled bags, repeat business.
            </p>
          </div>
          <div className="shrink-0 pt-1">
            <GroupMealsLogo size="sm" href={undefined} surface="light" />
          </div>
        </div>
      </header>

      <div className="shrink-0 border-y border-[var(--geaux-yellow)]/80 bg-[var(--geaux-cream)] px-8 py-4">
        <p className="text-center text-[15px] font-semibold leading-snug text-slate-800">
          Think of a{" "}
          <span className="text-[var(--geaux-red)]">big DoorDash or Uber Eats drop</span> — with
          advance notice, a final headcount, and{" "}
          <span className="text-[var(--geaux-red)]">time to prepare</span> before the lunch rush hits
          your line.
        </p>
      </div>

      <div className="one-sheet-main one-sheet-grid-2 grid shrink-0 grid-cols-1 items-start bg-[var(--geaux-cream)] sm:grid-cols-2">
        <section className="border-b border-slate-200/90 px-8 py-6 sm:border-b-0 sm:border-r">
          <SectionHeading>Why restaurants say yes</SectionHeading>
          <ul className="mt-4 space-y-3.5 text-[14px] leading-snug text-slate-800">
            {defaultBullets().map((b) => (
              <OneSheetBullet key={b.title} title={b.title}>
                {b.body}
              </OneSheetBullet>
            ))}
          </ul>
        </section>
        <section className="px-8 py-6">
          <SectionHeading>What lands in your inbox</SectionHeading>
          <div className="mt-4 space-y-3">
            {defaultInbox().map((row) => (
              <InboxRow key={row.when} when={row.when} what={row.what} />
            ))}
          </div>
        </section>
      </div>

      <section className="one-sheet-grid-3 one-sheet-steps grid shrink-0 grid-cols-1 gap-5 border-t border-slate-200 bg-white px-8 py-6 sm:grid-cols-3 sm:gap-6">
        {defaultSteps().map((s) => (
          <Step key={s.n} n={s.n} title={s.title}>
            {s.body}
          </Step>
        ))}
      </section>

      <footer className="one-sheet-footer geaux-header-gradient mt-auto shrink-0 px-8 py-5 text-center text-white">
        <p className="text-base font-bold leading-snug sm:text-[17px]">
          Let&apos;s put your restaurant on office lunch calendars.
        </p>
        <p className="mt-2 text-[13px] text-white/88">
          {BRAND.supportEmail} · {BRAND.name} · groupmeals.net
        </p>
      </footer>
    </article>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--geaux-red)]">{children}</h2>
  );
}

function defaultBullets() {
  return [
    {
      title: "Recurring office volume",
      body: "Companies order lunch Mon–Fri on rotation — predictable demand, not a one-time catering gig.",
    },
    {
      title: "Headcount before prep",
      body: "Customers order ahead; you get one kitchen email with every name, modifier, and delivery window.",
    },
    {
      title: "Already paid",
      body: "Customers checkout online. You deliver food, we handle the payments.",
    },
    {
      title: "You run delivery",
      body: "We email you the orders, you execute the orders and handle timely delivery.",
    },
    {
      title: "Your brand on the order screen",
      body: "Your logo, banner, and menu — you look like you, not a generic app.",
    },
    {
      title: "Feedback that sticks",
      body: "Verified post-lunch ratings so you know what to fix before the next rotation day.",
    },
  ];
}

function defaultInbox() {
  return [
    {
      when: "Morning of lunch",
      what: "Printable kitchen order list — headcount, mods, address, delivery window.",
    },
    {
      when: "Friday",
      what: "Weekly payout summary.",
    },
    {
      when: "Anytime in the portal",
      what: "Your menu, your timing — update items and pricing anytime.",
    },
  ];
}

function defaultSteps() {
  return [
    {
      n: "1",
      title: "Get on our office lunch rotation",
      body: "Our onboarding specialist uploads your menu, trains you on the portal, and shows you how to adjust items and pricing whenever you want.",
    },
    {
      n: "2",
      title: "Prepare orders from one email",
      body: "When ordering closes, you prepare, label each bag, and deliver on time.",
    },
    {
      n: "3",
      title: "Grow with the offices",
      body: "Great fulfillment → more participation → increased sales.",
    },
  ];
}

function OneSheetBullet({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5 text-[14px] leading-snug">
      <span
        className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--geaux-red)] text-[10px] font-bold text-white"
        aria-hidden
      >
        ✓
      </span>
      <span>
        <strong className="text-slate-900">{title}.</strong> {children}
      </span>
    </li>
  );
}

function InboxRow({ when, what }: { when: string; what: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--geaux-red)]">{when}</p>
      <p className="mt-1.5 text-[13px] leading-snug text-slate-800">{what}</p>
    </div>
  );
}

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-[var(--geaux-cream)]/60 px-4 py-4 text-left">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--geaux-red)] text-sm font-bold text-white">
        {n}
      </span>
      <p className="mt-3 text-sm font-bold leading-snug text-slate-900">{title}</p>
      <p className="mt-2 text-[13px] leading-relaxed text-slate-600">{children}</p>
    </div>
  );
}
