import { GroupMealsLogo } from "@/components/brand/GroupMealsLogo";
import { BRAND } from "@/lib/brand";
import {
  getRestaurantSalesKitEmailHtml,
  RESTAURANT_EMAIL_SAMPLES,
} from "@/lib/sales-kit/email-samples";
import { EmailSampleFrame } from "./EmailSampleFrame";
import { RestaurantPartnerPlaybook } from "./RestaurantPartnerPlaybook";
import { RestaurantPartnerPayoutTerms } from "./RestaurantPartnerPayoutTerms";
import { RestaurantSalesTaxNotice } from "./RestaurantSalesTaxNotice";
import { ReviewScreenMock, SatisfactionFlowCard } from "./SatisfactionFlowCard";

export function RestaurantSalesPacket() {
  return (
    <article className="sales-kit-document mx-auto max-w-3xl space-y-8 pb-12">
      <header className="sales-kit-cover break-inside-avoid overflow-hidden rounded-2xl geaux-header-gradient text-white shadow-lg">
        <div className="geaux-accent-bar" />
        <div className="px-8 py-10 text-center">
          <div className="flex justify-center">
            <GroupMealsLogo size="md" href={undefined} surface="light" />
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
            Partner overview
          </p>
          <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">
            Grow weekday lunch revenue — without adding delivery-app chaos
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/90">
            {BRAND.name} brings you recurring corporate volume: offices order days ahead, you get
            one clean prep list every morning, and we handle payments, reminders, and satisfaction
            tracking.
          </p>
        </div>
      </header>

      <section className="sales-kit-section break-inside-avoid rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-[var(--geaux-charcoal)]">
          The revenue opportunity
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Office lunch is not one big catering tray — it is dozens of individual meals, ordered on
          a deadline, delivered at the same window, week after week. That is high-margin repeat
          business if you can see it coming. {BRAND.name} puts that demand on your calendar instead
          of your phone ringing at 10:45 AM.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <RevenueStat
            label="Example office"
            value="45 people"
            detail="Lunch Mon–Fri when you're on rotation"
          />
          <RevenueStat
            label="Avg entrée"
            value="$13–$16"
            detail="Your menu, your pricing"
          />
          <RevenueStat
            label="Illustrative week"
            value="$2,925–$3,600"
            detail="45 × 5 days × entrée (food only)"
          />
        </div>
        <p className="mt-4 text-xs text-slate-500">
          Illustration only — actual volume depends on office size, schedule, and participation.
          Multiple offices on rotation multiply this effect.
        </p>
      </section>

      <section className="sales-kit-section break-inside-avoid rounded-2xl bg-[var(--geaux-cream)] p-6 ring-1 ring-slate-200">
        <h2 className="text-xl font-bold text-[var(--geaux-charcoal)]">Why restaurants win</h2>
        <ul className="mt-4 space-y-3 text-sm text-slate-700">
          <Bullet>
            <strong>Predictable batches</strong> — final headcount lands at cutoff; production
            matches demand instead of over-prepping.
          </Bullet>
          <Bullet>
            <strong>Corporate discovery</strong> — new offices meet you through rotation, not a
            one-off Groupon rush.
          </Bullet>
          <Bullet>
            <strong>Your brand on the order screen</strong> — logo and menu presentation that
            feels like your restaurant, not a generic marketplace.
          </Bullet>
          <Bullet>
            <strong>Operations that respect the kitchen</strong> — printable digests, modifiers
            spelled out, one contact email for fulfillment.
          </Bullet>
          <Bullet>
            <strong>Settlement visibility</strong> — weekly payout-style summaries so accounting
            knows what is coming.
          </Bullet>
          <Bullet>
            <strong>Transparent economics</strong> —{" "}
            <strong>12% commission on food sales (pre-tax)</strong> before payout; sales tax collected
            and passed through on settlement for your remittance.
          </Bullet>
        </ul>
      </section>

      <RestaurantPartnerPayoutTerms />
      <RestaurantSalesTaxNotice compact />

      <section className="sales-kit-section break-inside-avoid">
        <h2 className="mb-4 text-xl font-bold text-[var(--geaux-charcoal)]">
          At a glance
        </h2>
        <div className="grid gap-3 sm:grid-cols-4">
          {[
            ["1", "We schedule your day", "Offices pick you on their weekly rotation."],
            ["2", "Employees order online", "Cutoff gives you a firm count."],
            ["3", "You get the digest", "Print, prep, pack — deliver once."],
            ["4", "We settle & improve", "Payout summaries + verified reviews."],
          ].map(([n, t, d]) => (
            <div
              key={n}
              className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm"
            >
              <span className="text-2xl font-bold text-[var(--geaux-red)]">{n}</span>
              <p className="mt-2 text-sm font-semibold text-slate-800">{t}</p>
              <p className="mt-1 text-xs text-slate-600">{d}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-slate-600">
          The detailed partner playbook below covers onboarding through delivery — including labeling,
          sealing, and handoff standards.
        </p>
      </section>

      <RestaurantPartnerPlaybook />

      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-[var(--geaux-charcoal)]">
            Emails you actually receive
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Real templates from production — samples below match what partners get today.
          </p>
        </div>
        {RESTAURANT_EMAIL_SAMPLES.map((sample) => (
          <EmailSampleFrame
            key={sample.id}
            title={sample.title}
            when={sample.when}
            pitch={sample.pitch}
            html={getRestaurantSalesKitEmailHtml(sample.id)}
            compact
          />
        ))}
      </section>

      <SatisfactionFlowCard variant="restaurant" />

      <section className="sales-kit-section break-inside-avoid grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="text-lg font-bold text-[var(--geaux-charcoal)]">
            What customers see after lunch
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Ratings are tied to real orders — so you hear from people who actually ate your food
            that day, not random internet reviews.
          </p>
        </div>
        <ReviewScreenMock />
      </section>

      <section className="sales-kit-section break-inside-avoid rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-[var(--geaux-charcoal)]">Getting on the rotation</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-700">
          <li>
            Meet your onboarding specialist — we tailor menu, timing, and kitchen workflow to your
            operation.
          </li>
          <li>Share kitchen email and payout details; we configure digests and weekly summaries.</li>
          <li>Branding review so your order page looks sharp.</li>
          <li>First office day — we watch fulfillment closely and tune with your team.</li>
        </ol>
        <p className="mt-6 rounded-lg bg-[var(--geaux-red)] px-4 py-3 text-center text-sm font-semibold text-white">
          Ready to talk? {BRAND.supportEmail} · {BRAND.name}
        </p>
      </section>
    </article>
  );
}

function RevenueStat({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-[var(--geaux-cream)] p-4 text-center">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-[var(--geaux-red)]">{value}</p>
      <p className="mt-1 text-xs text-slate-600">{detail}</p>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--geaux-yellow)]" />
      <span>{children}</span>
    </li>
  );
}
