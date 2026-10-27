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
            For office leaders &amp; admins
          </p>
          <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">
            Office lunch from local restaurants — without the midday scramble
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/90">
            {BRAND.name} runs scheduled office lunch with local kitchens your team already likes.
            People order ahead, pay online, and bags show up labeled — so lunch stops living in the
            group chat.
          </p>
        </div>
      </header>

      <section className="sales-kit-print-unit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-[var(--geaux-charcoal)]">Why it works for busy offices</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          You are not asking someone to coordinate a giant delivery-app drop. You share one link, pick
          a rotation of local favorites, and we keep the restaurants and your team in sync.
        </p>
        <ul className="mt-4 space-y-3 text-sm text-slate-700">
          {[
            {
              title: "Local restaurants",
              body: "Real kitchens nearby — not a national ghost kitchen.",
            },
            {
              title: "Order ahead",
              body: "Your team picks meals online before lunch day; you get a clear headcount.",
            },
            {
              title: "Paid online",
              body: "No cash collection, no shared cards at the door.",
            },
            {
              title: "Labeled delivery",
              body: "Names on bags so distribution takes minutes, not a scavenger hunt.",
            },
            {
              title: "Someone watching quality",
              body: "Short post-lunch ratings tied to that meal — so the next week improves.",
            },
          ].map((b) => (
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
        <h2 className="text-xl font-bold text-[var(--geaux-charcoal)]">How a lunch day feels</h2>
        <div className="mt-4 space-y-3 text-sm text-slate-700">
          <WeekRow day="Ahead of time" what="Your team orders from the office link." />
          <WeekRow day="Morning of" what="Your point person gets a list of who ordered." />
          <WeekRow day="Lunch window" what="Meals arrive labeled and ready to hand out." />
          <WeekRow day="After" what="Optional short rating while the meal is still fresh." />
          <WeekRow day="Each week" what="A simple summary for planning the next rotation." />
        </div>
      </section>

      <section className="sales-kit-print-flow space-y-6 print:space-y-0">
        <div className="sales-kit-print-unit">
          <h2 className="text-xl font-bold text-[var(--geaux-charcoal)]">
            Emails your team &amp; admins receive
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Samples of what goes out in production — confirmations, the morning list, and follow-ups.
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

      <section className="sales-kit-print-flow grid gap-6 sm:grid-cols-2 items-center">
        <div className="sales-kit-print-unit">
          <ReviewScreenMock />
        </div>
        <div className="sales-kit-print-unit">
          <h2 className="text-lg font-bold text-[var(--geaux-charcoal)]">
            Feedback that improves next week
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            When someone notes a cold meal or a perfect special request, we see it next to the
            restaurant and office — not buried in a generic app review. That is how a local lunch
            program stays sharp.
          </p>
        </div>
      </section>

      <section className="sales-kit-print-unit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-[var(--geaux-charcoal)]">If we move forward</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          A {BRAND.name} specialist helps with setup — delivery notes, your order link, and the first
          week&apos;s restaurant rotation. You do not need to memorize how the platform works from this
          overview.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-slate-700">
          <li>Kickoff call and building / delivery details</li>
          <li>Office order link and admin access if you want it</li>
          <li>First live lunch week with our team on standby</li>
        </ul>
        <p className="mt-6 text-sm text-slate-600">
          <strong>Your link looks like:</strong>{" "}
          <span className="font-mono text-[var(--geaux-red)]">
            {appBase.replace(/\/$/, "")}/order/your-office
          </span>
        </p>
        <p className="mt-6 rounded-lg bg-[var(--geaux-red)] px-4 py-3 text-center text-sm font-semibold text-white">
          Let&apos;s plan your first week — {BRAND.supportEmail}
        </p>
      </section>
    </article>
  );
}

function WeekRow({ day, what }: { day: string; what: string }) {
  return (
    <div className="flex gap-4 rounded-lg bg-white px-4 py-3 shadow-sm">
      <span className="w-28 shrink-0 text-xs font-bold uppercase tracking-wide text-[var(--geaux-red)]">
        {day}
      </span>
      <span>{what}</span>
    </div>
  );
}
