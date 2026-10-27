import { GroupMealsLogo } from "@/components/brand/GroupMealsLogo";
import { BRAND } from "@/lib/brand";
import { OFFICE_PROSPECT } from "@/lib/sales-kit/office-prospect-copy";

/**
 * Single-page leave-behind for office prospects. Tuned for Print / Save PDF (US Letter).
 * Shares `restaurant-one-sheet` layout/print classes with the restaurant leave-behind.
 */
export function OfficeCustomerOneSheet() {
  const copy = OFFICE_PROSPECT;

  return (
    <article className="restaurant-one-sheet mx-auto flex min-h-[11in] w-full max-w-[8.5in] flex-col bg-white text-[var(--geaux-charcoal)] shadow-lg">
      <header className="one-sheet-hero relative shrink-0 overflow-hidden geaux-header-gradient px-8 py-7 text-white">
        <div className="geaux-accent-bar" />
        <div className="flex items-start justify-between gap-5">
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/75">
              {copy.eyebrow}
            </p>
            <h1 className="mt-2.5 text-[1.75rem] font-bold leading-[1.15] tracking-tight">
              {copy.headline}
            </h1>
            <p className="mt-3 max-w-[34rem] text-[15px] leading-relaxed text-white/92">{copy.subhead}</p>
          </div>
          <div className="shrink-0 pt-1">
            <GroupMealsLogo size="sm" href={undefined} surface="light" />
          </div>
        </div>
      </header>

      <div className="shrink-0 border-y border-[var(--geaux-yellow)]/80 bg-[var(--geaux-cream)] px-8 py-4">
        <p className="text-center text-[15px] font-semibold leading-snug text-slate-800">{copy.banner}</p>
      </div>

      <div className="one-sheet-main one-sheet-grid-2 grid shrink-0 grid-cols-1 items-start bg-[var(--geaux-cream)] sm:grid-cols-2">
        <section className="border-b border-slate-200/90 px-8 py-6 sm:border-b-0 sm:border-r">
          <SectionHeading>{copy.whyHeading}</SectionHeading>
          <ul className="mt-4 space-y-3.5 text-[14px] leading-snug text-slate-800">
            {copy.whyBullets.map((b) => (
              <OneSheetBullet key={b.title} title={b.title}>
                {b.body}
              </OneSheetBullet>
            ))}
          </ul>
        </section>
        <section className="px-8 py-6">
          <SectionHeading>{copy.teamHeading}</SectionHeading>
          <div className="mt-4 space-y-3">
            {copy.teamRows.map((row) => (
              <InboxRow key={row.when} when={row.when} what={row.what} />
            ))}
          </div>
        </section>
      </div>

      <section className="one-sheet-grid-3 one-sheet-steps grid shrink-0 grid-cols-1 gap-5 border-t border-slate-200 bg-white px-8 py-6 sm:grid-cols-3 sm:gap-6">
        {copy.steps.map((s) => (
          <Step key={s.n} n={s.n} title={s.title}>
            {s.body}
          </Step>
        ))}
      </section>

      <footer className="one-sheet-footer geaux-header-gradient mt-auto shrink-0 px-8 py-5 text-center text-white">
        <p className="text-base font-bold leading-snug sm:text-[17px]">{copy.footerTitle}</p>
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

function OneSheetBullet({ title, children }: { title: string; children: React.ReactNode }) {
  const hasBody = typeof children === "string" ? children.trim().length > 0 : Boolean(children);
  return (
    <li className="flex gap-2.5 text-[14px] leading-snug">
      <span
        className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--geaux-red)] text-[10px] font-bold text-white"
        aria-hidden
      >
        ✓
      </span>
      <span>
        {hasBody ? (
          <>
            <strong className="text-slate-900">{title}.</strong> {children}
          </>
        ) : (
          <strong className="text-slate-900">{title}.</strong>
        )}
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
