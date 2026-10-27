import { GroupMealsLogo } from "@/components/brand/GroupMealsLogo";
import { BRAND } from "@/lib/brand";

/**
 * Single-page leave-behind for office prospects. Tuned for Print / Save PDF (US Letter).
 * Shares `restaurant-one-sheet` layout/print classes with the restaurant leave-behind.
 */
export function OfficeCustomerOneSheet() {
  return (
    <article className="restaurant-one-sheet mx-auto flex min-h-[11in] w-full max-w-[8.5in] flex-col bg-white text-[var(--geaux-charcoal)] shadow-lg">
      <header className="one-sheet-hero relative shrink-0 overflow-hidden geaux-header-gradient px-8 py-7 text-white">
        <div className="geaux-accent-bar" />
        <div className="flex items-start justify-between gap-5">
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/75">
              For office teams
            </p>
            <h1 className="mt-2.5 text-[1.75rem] font-bold leading-[1.15] tracking-tight">
              Office lunch from local restaurants — without the midday scramble.
            </h1>
            <p className="mt-3 max-w-[34rem] text-[15px] leading-relaxed text-white/92">
              {BRAND.name} puts a weekly rotation of local favorites on your calendar. Your team
              orders ahead, pays online, and lunch shows up labeled and on time — so nobody is
              juggling group orders in chat.
            </p>
          </div>
          <div className="shrink-0 pt-1">
            <GroupMealsLogo size="sm" href={undefined} surface="light" />
          </div>
        </div>
      </header>

      <div className="shrink-0 border-y border-[var(--geaux-yellow)]/80 bg-[var(--geaux-cream)] px-8 py-4">
        <p className="text-center text-[15px] font-semibold leading-snug text-slate-800">
          Real kitchens nearby. Prepaid meals that land when you need them.
        </p>
      </div>

      <div className="one-sheet-main one-sheet-grid-2 grid shrink-0 grid-cols-1 items-start bg-[var(--geaux-cream)] sm:grid-cols-2">
        <section className="border-b border-slate-200/90 px-8 py-6 sm:border-b-0 sm:border-r">
          <SectionHeading>Why offices switch</SectionHeading>
          <ul className="mt-4 space-y-3.5 text-[14px] leading-snug text-slate-800">
            {whyBullets().map((b) => (
              <OneSheetBullet key={b.title} title={b.title}>
                {b.body}
              </OneSheetBullet>
            ))}
          </ul>
        </section>
        <section className="px-8 py-6">
          <SectionHeading>What your team gets</SectionHeading>
          <div className="mt-4 space-y-3">
            {inboxRows().map((row) => (
              <InboxRow key={row.when} when={row.when} what={row.what} />
            ))}
          </div>
        </section>
      </div>

      <section className="one-sheet-grid-3 one-sheet-steps grid shrink-0 grid-cols-1 gap-5 border-t border-slate-200 bg-white px-8 py-6 sm:grid-cols-3 sm:gap-6">
        {steps().map((s) => (
          <Step key={s.n} n={s.n} title={s.title}>
            {s.body}
          </Step>
        ))}
      </section>

      <footer className="one-sheet-footer geaux-header-gradient mt-auto shrink-0 px-8 py-5 text-center text-white">
        <p className="text-base font-bold leading-snug sm:text-[17px]">
          Ready for a quieter lunch hour? Let&apos;s plan your first week.
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
    <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--geaux-red)]">
      {children}
    </h2>
  );
}

function whyBullets() {
  return [
    {
      title: "Local restaurants",
      body: "Places your team already likes — not a national ghost kitchen or mystery bag.",
    },
    {
      title: "Order ahead",
      body: "Everyone picks their meal online before lunch day. You get a clean headcount.",
    },
    {
      title: "Paid online",
      body: "No cash at the door, no shared cards, no collecting receipts after the fact.",
    },
    {
      title: "Labeled delivery",
      body: "Bags show up with names on them — grab-and-go, not a pile of unmarked boxes.",
    },
    {
      title: "Feedback that matters",
      body: "After lunch, each person can leave a short rating on that specific meal. We use it to catch issues early and push restaurants to improve food and service the next time they are on your rotation.",
    },
  ];
}

function inboxRows() {
  return [
    {
      when: "When they order",
      what: "Each customer receives an order confirmation email along with the set delivery time.",
    },
    {
      when: "Morning of lunch",
      what: "Your point person gets a list of who ordered — useful at the front desk.",
    },
    {
      when: "After lunch",
      what: "A short review request so we can improve food quality and service for the next week.",
    },
  ];
}

function steps() {
  return [
    {
      n: "1",
      title: "Tell us about your office",
      body: "Building address, delivery notes, and who should get the morning list.",
    },
    {
      n: "2",
      title: "Share your order link",
      body: "We set up the page and a rotation of local restaurants for the week.",
    },
    {
      n: "3",
      title: "Lunch runs itself",
      body: "Your team orders, kitchens prep, bags arrive — you stay out of the middle.",
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
