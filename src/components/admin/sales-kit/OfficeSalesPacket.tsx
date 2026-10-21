import { GroupMealsLogo } from "@/components/brand/GroupMealsLogo";
import { BRAND } from "@/lib/brand";
import {
  getOfficeSalesKitEmailHtml,
  OFFICE_EMAIL_SAMPLES,
} from "@/lib/sales-kit/email-samples";
import { EmailSampleFrame } from "./EmailSampleFrame";
import { ReviewScreenMock, SatisfactionFlowCard } from "./SatisfactionFlowCard";

export function OfficeSalesPacket({ appBase }: { appBase: string }) {
  return (
    <article className="sales-kit-document mx-auto max-w-3xl space-y-8 pb-12 print:space-y-0 print:pb-0">
      <header className="sales-kit-cover break-inside-avoid overflow-hidden rounded-2xl geaux-header-gradient text-white shadow-lg">
        <div className="geaux-accent-bar" />
        <div className="px-8 py-10 text-center">
          <div className="flex justify-center">
            <GroupMealsLogo size="md" href={undefined} surface="light" />
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
            For office leaders & admins
          </p>
          <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">
            Lunch your team will brag about — from real local restaurants
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/90">
            {BRAND.name} is not a national ghost kitchen. We run scheduled office lunch with
            Baton Rouge partners you already know: clear cutoffs, reliable delivery, and a human
            team that tracks whether lunch actually landed well.
          </p>
        </div>
      </header>

      <section className="sales-kit-section break-inside-avoid rounded-2xl border-2 border-[var(--geaux-red)]/20 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-[var(--geaux-charcoal)]">
          The personal touch — without the personal hassle
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          You are not asking someone to coordinate a 40-person DoorDash drop. You are giving
          employees a simple link, a weekly rotation of local favorites, and an ops partner who
          sends confirmations, order lists, and satisfaction surveys so nobody has to chase lunch in
          Slack.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <PromiseCard
            title="Fulfillment you can trust"
            items={[
              "Ordering closes on a published cutoff — kitchens know your headcount.",
              "Office admins get a morning digest before delivery.",
              "Individually packed meals with modifiers and notes honored.",
            ]}
          />
          <PromiseCard
            title="Satisfaction you can measure"
            items={[
              "Post-lunch review emails (one per order, not spam).",
              "Star ratings + comments tied to restaurant and date.",
              `${BRAND.name} monitors trends and responds when something slips.`,
            ]}
          />
        </div>
      </section>

      <section className="sales-kit-section break-inside-avoid rounded-2xl bg-[var(--geaux-cream)] p-6 ring-1 ring-slate-200">
        <h2 className="text-xl font-bold text-[var(--geaux-charcoal)]">A typical week</h2>
        <div className="mt-4 space-y-3 text-sm text-slate-700">
          <WeekRow day="Mon–Thu" what="Employees order from the week view — up to 48 hours ahead." />
          <WeekRow day="Morning of" what="Restaurant + your admin receive fulfillment emails." />
          <WeekRow day="Delivery window" what="Lunch arrives on schedule; names on bags." />
          <WeekRow day="After lunch" what="Quick ‘how was it?’ survey while memory is fresh." />
          <WeekRow day="Friday" what="Weekly summary email — meals by day for planning." />
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-[var(--geaux-charcoal)]">
            Emails your team & admins receive
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Below are live samples from the platform — the same HTML your employees and office leads
            get in production.
          </p>
        </div>
        {OFFICE_EMAIL_SAMPLES.map((sample) => (
          <EmailSampleFrame
            key={sample.id}
            title={sample.title}
            when={sample.when}
            pitch={sample.pitch}
            html={getOfficeSalesKitEmailHtml(sample.id, appBase)}
            compact={sample.id === "review-invite"}
          />
        ))}
      </section>

      <SatisfactionFlowCard variant="office" />

      <section className="sales-kit-section break-inside-avoid grid gap-6 sm:grid-cols-2 items-center">
        <ReviewScreenMock />
        <div>
          <h2 className="text-lg font-bold text-[var(--geaux-charcoal)]">
            Feedback that improves next week
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            When someone says the sandwich was cold or the special request was perfect, we see it
            alongside the restaurant and office — not buried in a generic app store review. That is
            how local lunch programs stay sharp.
          </p>
        </div>
      </section>

      <section className="sales-kit-section break-inside-avoid rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-[var(--geaux-charcoal)]">What we need from you</h2>
        <ul className="mt-4 space-y-2 text-sm text-slate-700">
          <li>A point person for delivery (name + phone) and any building instructions.</li>
          <li>Employee list or open signup — we provide your office order link.</li>
          <li>Optional: office admin login to see orders and weekly summaries.</li>
        </ul>
        <p className="mt-6 text-sm text-slate-600">
          <strong>Your link looks like:</strong>{" "}
          <span className="font-mono text-[var(--geaux-red)]">
            {appBase.replace(/\/$/, "")}/order/your-office
          </span>
        </p>
        <p className="mt-6 rounded-lg bg-[var(--geaux-red)] px-4 py-3 text-center text-sm font-semibold text-white">
          Let&apos;s set up your first week — {BRAND.supportEmail}
        </p>
      </section>
    </article>
  );
}

function PromiseCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-[var(--geaux-cream)] p-4">
      <h3 className="font-semibold text-slate-800">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm text-slate-600">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="text-[var(--geaux-red)]">✓</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function WeekRow({ day, what }: { day: string; what: string }) {
  return (
    <div className="flex gap-4 rounded-lg bg-white px-4 py-3 shadow-sm">
      <span className="w-24 shrink-0 text-xs font-bold uppercase tracking-wide text-[var(--geaux-red)]">
        {day}
      </span>
      <span>{what}</span>
    </div>
  );
}
