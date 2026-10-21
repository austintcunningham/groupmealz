import { GroupMealsLogo } from "@/components/brand/GroupMealsLogo";
import { BRAND } from "@/lib/brand";

/**
 * Single-page leave-behind for restaurant prospects. Tuned for Print / Save PDF (US Letter).
 */
export function RestaurantPartnerOneSheet() {
  return (
    <article className="restaurant-one-sheet mx-auto max-w-[8.5in] bg-white text-[var(--geaux-charcoal)] shadow-lg print:max-w-none print:shadow-none">
      {/* Hero — hook first */}
      <header className="relative overflow-hidden geaux-header-gradient px-8 py-7 text-white print:py-6">
        <div className="geaux-accent-bar print:hidden" />
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/75">
              For restaurant partners
            </p>
            <h1 className="mt-2 text-[1.65rem] font-bold leading-[1.15] tracking-tight sm:text-3xl print:text-[1.55rem]">
              Fill your lunch day with orders you can see coming — not last-minute chaos.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-snug text-white/90 print:text-[13px]">
              {BRAND.name} connects local offices to your kitchen: employees order ahead, pay online,
              and you get <strong className="text-white">one final prep list</strong> every morning.
              Same window, labeled bags, repeat business.
            </p>
          </div>
          <div className="hidden shrink-0 sm:block print:block">
            <GroupMealsLogo size="sm" href={undefined} surface="light" />
          </div>
        </div>
      </header>

      <div className="grid gap-0 border-b border-slate-200 sm:grid-cols-2">
        <section className="border-b border-slate-200 p-6 sm:border-b-0 sm:border-r print:p-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--geaux-red)]">
            Why owners say yes
          </h2>
          <ul className="mt-4 space-y-3.5 text-[13px] leading-snug text-slate-800 print:text-[12px]">
            <OneSheetBullet title="Recurring office volume">
              Companies lunch Mon–Fri on rotation — predictable demand, not a one-time catering gig.
            </OneSheetBullet>
            <OneSheetBullet title="Final headcount at cutoff">
              No partial counts while people order. One kitchen email after cutoff with every name,
              modifier, and delivery time.
            </OneSheetBullet>
            <OneSheetBullet title="Already paid">
              Customers checkout online. You deliver food — not invoices.
            </OneSheetBullet>
            <OneSheetBullet title="Your brand on the order screen">
              Your logo, banner, and menu — you look like you, not a generic app.
            </OneSheetBullet>
            <OneSheetBullet title="Feedback that sticks">
              Verified post-lunch ratings so you know what to fix before the next rotation day.
            </OneSheetBullet>
          </ul>
        </section>

        <section className="bg-[var(--geaux-cream)] p-6 print:p-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--geaux-red)]">
            What lands in your inbox
          </h2>
          <div className="mt-4 space-y-3 text-[13px] print:text-[12px]">
            <InboxRow when="Morning of lunch" what="Printable kitchen run sheet — headcount, mods, address, delivery window." />
            <InboxRow when="Friday" what="Weekly payout-style summary — meals sold, food sales, settlement estimate." />
          </div>
          <div className="mt-5 rounded-lg border border-[var(--geaux-yellow)] bg-white px-3 py-2.5 text-[11px] leading-snug text-slate-600">
            <strong className="text-slate-800">Simple economics:</strong> 12% partner fee on food
            subtotal (pre-tax). Sales tax collected at checkout and included in your settlement for
            remittance.
          </div>
        </section>
      </div>

      <section className="grid gap-4 px-6 py-5 sm:grid-cols-3 print:px-5 print:py-4">
        <Step n="1" title="Get on the rotation">
          Offices pick you for specific weekdays. We configure your menu with an onboarding specialist.
        </Step>
        <Step n="2" title="Prep from one email">
          After cutoff, produce exactly what&apos;s on the sheet — label each bag, deliver on time.
        </Step>
        <Step n="3" title="Grow with the offices">
          Great fulfillment → more participation → more weeks on the calendar.
        </Step>
      </section>

      <footer className="flex flex-col items-center justify-between gap-3 geaux-header-gradient px-6 py-5 text-center text-white sm:flex-row sm:text-left print:py-4">
        <div>
          <p className="text-sm font-bold">Let&apos;s put your restaurant on office lunch calendars.</p>
          <p className="mt-1 text-xs text-white/85">
            {BRAND.supportEmail} · {BRAND.name} · groupmeals.net
          </p>
        </div>
        <p className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-[var(--geaux-red)] shadow-sm">
          Ask for a 15-minute partner intro
        </p>
      </footer>

      <p className="px-6 pb-4 text-center text-[10px] text-slate-400 print:pb-2">
        Full partner playbook, email samples, and order-screen preview — {BRAND.name} admin sales kit.
      </p>
    </article>
  );
}

function OneSheetBullet({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5">
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

function InboxRow({ when, what }: { when: string; what: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--geaux-red)]">{when}</p>
      <p className="mt-0.5 text-slate-700">{what}</p>
    </div>
  );
}

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div className="text-center sm:text-left">
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--geaux-red)] text-xs font-bold text-white">
        {n}
      </span>
      <p className="mt-2 text-sm font-bold text-slate-900">{title}</p>
      <p className="mt-1 text-[12px] leading-snug text-slate-600 print:text-[11px]">{children}</p>
    </div>
  );
}
