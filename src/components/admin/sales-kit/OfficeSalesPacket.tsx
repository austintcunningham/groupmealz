import { GroupMealsLogo } from "@/components/brand/GroupMealsLogo";
import { BRAND } from "@/lib/brand";
import {
  getOfficeSalesKitEmailHtml,
  OFFICE_EMAIL_SAMPLES,
} from "@/lib/sales-kit/email-samples";
import { OFFICE_PROSPECT } from "@/lib/sales-kit/office-prospect-copy";
import { EmailSampleFrame } from "./EmailSampleFrame";
import { ReviewScreenMock, SatisfactionFlowCard } from "./SatisfactionFlowCard";

export function OfficeSalesPacket({ appBase }: { appBase: string }) {
  const copy = OFFICE_PROSPECT;

  return (
    <article className="sales-kit-document mx-auto max-w-3xl space-y-8 pb-12 print:space-y-0 print:pb-0">
      <header className="sales-kit-cover break-inside-avoid overflow-hidden rounded-2xl geaux-header-gradient text-white shadow-lg print:rounded-none print:shadow-none">
        <div className="geaux-accent-bar" />
        <div className="px-8 py-10 text-center print:px-4 print:py-4">
          <div className="flex justify-center">
            <GroupMealsLogo size="md" href={undefined} surface="light" />
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
            {copy.eyebrow}
          </p>
          <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">{copy.headline}</h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/90">{copy.subhead}</p>
        </div>
      </header>

      <section className="sales-kit-print-unit rounded-2xl border border-[var(--geaux-yellow)]/80 bg-[var(--geaux-cream)] px-6 py-4 shadow-sm">
        <p className="text-center text-sm font-semibold leading-snug text-slate-800">{copy.banner}</p>
      </section>

      <section className="sales-kit-print-unit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-[var(--geaux-charcoal)]">{copy.whyHeading}</h2>
        <ul className="mt-4 space-y-3 text-sm text-slate-700">
          {copy.whyBullets.map((b) => (
            <li key={b.title} className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--geaux-yellow)]" />
              <span>
                <strong>{b.title}</strong> — {b.body}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="sales-kit-print-unit rounded-2xl bg-[var(--geaux-cream)] p-6 ring-1 ring-slate-200">
        <h2 className="text-xl font-bold text-[var(--geaux-charcoal)]">{copy.teamHeading}</h2>
        <div className="mt-4 space-y-3 text-sm text-slate-700">
          {copy.teamRows.map((row) => (
            <div key={row.when} className="flex gap-4 rounded-lg bg-white px-4 py-3 shadow-sm">
              <span className="w-36 shrink-0 text-xs font-bold uppercase tracking-wide text-[var(--geaux-red)]">
                {row.when}
              </span>
              <span>{row.what}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="sales-kit-print-flow">
        <div className="sales-kit-print-unit mb-4">
          <h2 className="text-xl font-bold text-[var(--geaux-charcoal)]">Getting started</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {copy.steps.map((s) => (
            <div
              key={s.n}
              className="sales-kit-print-unit rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm"
            >
              <span className="text-2xl font-bold text-[var(--geaux-red)]">{s.n}</span>
              <p className="mt-2 text-sm font-semibold text-slate-800">{s.title}</p>
              <p className="mt-1 text-xs text-slate-600">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="sales-kit-print-flow space-y-6 print:space-y-0">
        <div className="sales-kit-print-unit">
          <h2 className="text-xl font-bold text-[var(--geaux-charcoal)]">
            Emails your team &amp; admins receive
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Samples of what goes out in production — confirmations, the order list, and review
            requests.
          </p>
        </div>
        {OFFICE_EMAIL_SAMPLES.map((sample) => (
          <EmailSampleFrame
            key={sample.id}
            title={sample.title}
            when={sample.when}
            pitch={sample.pitch}
            html={getOfficeSalesKitEmailHtml(sample.id, appBase)}
            compact={
              sample.id === "review-invite" || sample.id === "customer-confirmation"
            }
          />
        ))}
      </section>

      <SatisfactionFlowCard variant="office" />

      <section className="sales-kit-print-flow grid gap-6 sm:grid-cols-2 items-center">
        <div className="sales-kit-print-unit">
          <ReviewScreenMock />
        </div>
        <div className="sales-kit-print-unit">
          <h2 className="text-lg font-bold text-[var(--geaux-charcoal)]">Feedback that matters</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            After lunch, each person can leave a short rating on that specific meal. We use it to
            catch issues early and push restaurants to improve food and service the next time they
            are on your rotation.
          </p>
        </div>
      </section>

      <section className="sales-kit-print-unit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-[var(--geaux-charcoal)]">Next step</h2>
        <p className="mt-3 text-sm text-slate-700">{copy.footerTitle}</p>
        <p className="mt-3 text-sm text-slate-600">
          Your order link looks like{" "}
          <span className="font-mono text-[var(--geaux-red)]">
            {appBase.replace(/\/$/, "")}/order/your-office
          </span>
          .
        </p>
        <p className="mt-6 rounded-lg bg-[var(--geaux-red)] px-4 py-3 text-center text-sm font-semibold text-white">
          {BRAND.supportEmail} · {BRAND.name}
        </p>
      </section>
    </article>
  );
}
