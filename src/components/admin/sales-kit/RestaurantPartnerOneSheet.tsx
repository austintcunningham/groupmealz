import { GroupMealsLogo } from "@/components/brand/GroupMealsLogo";
import { BRAND } from "@/lib/brand";

/**
 * Single-page leave-behind for restaurant prospects. Tuned for Print / Save PDF (US Letter).
 * Layout classes `one-sheet-grid-*` pair with globals.css so print matches desktop preview.
 */
export function RestaurantPartnerOneSheet() {
  return (
    <article className="restaurant-one-sheet mx-auto max-w-[8.5in] bg-white text-[var(--geaux-charcoal)] shadow-lg">
      <header className="one-sheet-hero relative overflow-hidden geaux-header-gradient px-8 py-7 text-white">
        <div className="geaux-accent-bar" />
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/75">
              For restaurant partners
            </p>
            <h1 className="mt-2 text-3xl font-bold leading-[1.15] tracking-tight">
              Fill your lunch day with orders you can see coming — not last-minute chaos.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-snug text-white/90">
              {BRAND.name} connects local offices to your kitchen: employees order ahead, pay online,
              and you get <strong className="text-white">one final order list</strong> every morning.
              Same window, labeled bags, repeat business.
            </p>
          </div>
          <div className="shrink-0">
            <GroupMealsLogo size="sm" href={undefined} surface="light" />
          </div>
        </div>
      </header>

      <div className="border-b border-[var(--geaux-yellow)] bg-[var(--geaux-cream)] px-6 py-4">
        <p className="text-center text-[13px] font-semibold leading-snug text-slate-800">
          Think of a{" "}
          <span className="text-[var(--geaux-red)]">big DoorDash or Uber Eats drop</span> — with a
          real cutoff, a final headcount, and{" "}
          <span className="text-[var(--geaux-red)]">time to prepare</span> before the lunch rush hits
          your line.
        </p>
      </div>

      <div className="one-sheet-grid-2 grid gap-0 border-b border-slate-200 sm:grid-cols-2">
        <section className="border-b border-slate-200 p-6 sm:border-b-0 sm:border-r">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--geaux-red)]">
            Why owners say yes
          </h2>
          <ul className="mt-4 space-y-3.5 text-[13px] leading-snug text-slate-800">
            <OneSheetBullet title="Recurring office volume">
              Companies order lunch Mon–Fri on rotation — predictable demand, not a one-time catering
              gig.
            </OneSheetBullet>
            <OneSheetBullet title="Final headcount at cutoff">
              No partial counts while people order. One kitchen email after cutoff with every name,
              modifier, and delivery time.
            </OneSheetBullet>
            <OneSheetBullet title="Already paid">
              Customers checkout online. You deliver food, we handle the payments.
            </OneSheetBullet>
            <OneSheetBullet title="Your brand on the order screen">
              Your logo, banner, and menu — you look like you, not a generic app.
            </OneSheetBullet>
            <OneSheetBullet title="Feedback that sticks">
              Verified post-lunch ratings so you know what to fix before the next rotation day.
            </OneSheetBullet>
          </ul>
        </section>

        <section className="bg-[var(--geaux-cream)] p-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--geaux-red)]">
            What lands in your inbox
          </h2>
          <div className="mt-4 space-y-3 text-[13px]">
            <InboxRow
              when="Morning of lunch"
              what="Printable kitchen order list — headcount, mods, address, delivery window."
            />
            <InboxRow
              when="Friday"
              what="Weekly payout-style summary — meals sold, food sales, settlement estimate."
            />
          </div>
          <div className="mt-5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[11px] leading-snug text-slate-700 shadow-sm">
            <strong className="text-slate-900">Your menu, your timing.</strong> Update items and
            pricing anytime in the platform — perfect for limited-time specials and seasonal pushes
            without waiting on a third party to approve changes.
          </div>
        </section>
      </div>

      <section className="one-sheet-grid-3 grid gap-4 px-6 py-5 sm:grid-cols-3">
        <Step n="1" title="Get on our office lunch rotation">
          Our onboarding specialist uploads your menu, trains you on the portal, and shows you how
          to adjust items and pricing whenever you want.
        </Step>
        <Step n="2" title="Prepare orders from one email">
          After cutoff, produce exactly what&apos;s on the order list — label each bag, deliver on
          time.
        </Step>
        <Step n="3" title="Grow with the offices">
          Great fulfillment → more participation → increased sales.
        </Step>
      </section>

      <footer className="geaux-header-gradient px-6 py-5 text-left text-white">
        <p className="text-sm font-bold">Let&apos;s put your restaurant on office lunch calendars.</p>
        <p className="mt-1 text-xs text-white/85">
          {BRAND.supportEmail} · {BRAND.name} · groupmeals.net
        </p>
      </footer>
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
    <div className="text-left">
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--geaux-red)] text-xs font-bold text-white">
        {n}
      </span>
      <p className="mt-2 text-sm font-bold text-slate-900">{title}</p>
      <p className="mt-1 text-[12px] leading-snug text-slate-600">{children}</p>
    </div>
  );
}
