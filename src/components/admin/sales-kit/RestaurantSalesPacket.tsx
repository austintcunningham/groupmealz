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
import { RestaurantSalesKitOrderPreview } from "./RestaurantSalesKitOrderPreview";
import { ReviewScreenMock, SatisfactionFlowCard } from "./SatisfactionFlowCard";
import type { SalesKitOrderPreviewSample } from "@/lib/sales-kit/order-preview-sample";

export function RestaurantSalesPacket({
  orderPreview,
}: {
  orderPreview: SalesKitOrderPreviewSample;
}) {
  return (
    <article className="sales-kit-document mx-auto max-w-3xl space-y-8 pb-12 print:space-y-0 print:pb-0">
      <header className="sales-kit-cover break-inside-avoid overflow-hidden rounded-2xl geaux-header-gradient text-white shadow-lg print:rounded-none print:shadow-none">
        <div className="geaux-accent-bar" />
        <div className="px-8 py-10 text-center print:px-4 print:py-4">
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
            {BRAND.name} puts recurring corporate lunch on your calendar: employees order days ahead,
            you get one clean order list email every morning, you prepare and deliver — we handle
            payments, reminders, and satisfaction tracking.
          </p>
        </div>
      </header>

      <section className="sales-kit-print-unit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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
            label="Example order"
            value="20–45 people"
            detail="One office lunch day when you're on rotation"
          />
          <RevenueStat
            label="Avg entrée"
            value="$13–$16"
            detail="Your menu, your pricing — update anytime in the portal"
          />
          <RevenueStat
            label="Illustrative week"
            value="$1,300–$3,600"
            detail="20–45 people × 5 days × entrée (food only)"
          />
        </div>
        <p className="mt-4 text-xs text-slate-500">
          Illustration only — actual volume depends on office size, schedule, and participation.
          Multiple offices on rotation multiply this effect.
        </p>
      </section>

      <section className="sales-kit-print-unit rounded-2xl bg-[var(--geaux-cream)] p-6 ring-1 ring-slate-200">
        <h2 className="text-xl font-bold text-[var(--geaux-charcoal)]">Why restaurants win</h2>
        <ul className="mt-4 space-y-3 text-sm text-slate-700">
          <Bullet>
            <strong>Predictable batches</strong> — final headcount lands at cutoff; you produce from
            the order list instead of guessing.
          </Bullet>
          <Bullet>
            <strong>You deliver</strong> — we email the final order list; you prepare, label bags,
            and handle timely delivery to the office.
          </Bullet>
          <Bullet>
            <strong>Corporate discovery</strong> — new offices meet you on our lunch rotation, not a
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
            <strong>12% commission on food subtotal only</strong> — tax is set aside first, then
            commission; tax is settled to you for remittance.
          </Bullet>
        </ul>
      </section>

      <RestaurantSalesKitOrderPreview sample={orderPreview} />

      <RestaurantPartnerPayoutTerms />
      <div className="sales-kit-print-unit">
        <RestaurantSalesTaxNotice compact />
      </div>

      <section className="sales-kit-print-flow">
        <div className="sales-kit-print-unit mb-4">
          <h2 className="text-xl font-bold text-[var(--geaux-charcoal)]">At a glance</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-4">
          {[
            ["1", "Get on the rotation", "Onboarding uploads your menu; you control items and pricing anytime."],
            ["2", "Employees order online", "Cutoff gives you a firm count."],
            ["3", "You get the digest", "Print the order list, pack, deliver once."],
            ["4", "We settle & improve", "Payout summaries + verified reviews."],
          ].map(([n, t, d]) => (
            <div
              key={n}
              className="sales-kit-print-unit rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm"
            >
              <span className="text-2xl font-bold text-[var(--geaux-red)]">{n}</span>
              <p className="mt-2 text-sm font-semibold text-slate-800">{t}</p>
              <p className="mt-1 text-xs text-slate-600">{d}</p>
            </div>
          ))}
        </div>
        <div className="sales-kit-print-unit mt-4 text-sm text-slate-600">
          The detailed partner playbook below covers onboarding through delivery — including labeling,
          sealing, and handoff standards.
        </div>
      </section>

      <RestaurantPartnerPlaybook />

      <section className="sales-kit-print-flow space-y-6 print:space-y-0">
        <div className="sales-kit-print-unit">
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

      <section className="sales-kit-print-flow grid gap-6 sm:grid-cols-2">
        <div className="sales-kit-print-unit">
          <h2 className="text-lg font-bold text-[var(--geaux-charcoal)]">
            What customers see after lunch
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Ratings are tied to real orders — so you hear from people who actually ate your food
            that day, not random internet reviews.
          </p>
        </div>
        <div className="sales-kit-print-unit">
          <ReviewScreenMock />
        </div>
      </section>

      <section className="sales-kit-print-unit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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
