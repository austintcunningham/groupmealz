import { GroupMealsLogo } from "@/components/brand/GroupMealsLogo";
import { BRAND } from "@/lib/brand";
import {
  getRestaurantSalesKitEmailHtml,
  RESTAURANT_EMAIL_SAMPLES,
} from "@/lib/sales-kit/email-samples";
import {
  getRestaurantProspectContent,
  type RestaurantProspectId,
} from "@/lib/sales-kit/restaurant-prospect-variants";
import { EmailSampleFrame } from "./EmailSampleFrame";
import { RestaurantCateringProspectSection } from "./RestaurantCateringProspectSection";
import { RestaurantSalesKitOnboardingTeaser } from "./RestaurantSalesKitOnboardingTeaser";
import { RestaurantSalesKitOrderPreview } from "./RestaurantSalesKitOrderPreview";
import { ReviewScreenMock, SatisfactionFlowCard } from "./SatisfactionFlowCard";
import type { SalesKitOrderPreviewSample } from "@/lib/sales-kit/order-preview-sample";

export function RestaurantSalesPacket({
  orderPreview,
  prospectId = "default",
}: {
  orderPreview: SalesKitOrderPreviewSample;
  prospectId?: RestaurantProspectId;
}) {
  const prospect = getRestaurantProspectContent(prospectId);
  const emailSamples = prospect.emailSamples ?? RESTAURANT_EMAIL_SAMPLES;
  const atAGlance = atAGlanceSteps();

  return (
    <article className="sales-kit-document mx-auto max-w-3xl space-y-8 pb-12 print:space-y-0 print:pb-0">
      <header className="sales-kit-cover break-inside-avoid overflow-hidden rounded-2xl geaux-header-gradient text-white shadow-lg print:rounded-none print:shadow-none">
        <div className="geaux-accent-bar" />
        <div className="px-8 py-10 text-center print:px-4 print:py-4">
          <div className="flex justify-center">
            <GroupMealsLogo size="md" href={undefined} surface="light" />
          </div>
          {prospect.coverEyebrow ? (
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
              {prospect.coverEyebrow}
            </p>
          ) : null}
          <h1
            className={`${prospect.coverEyebrow ? "mt-2" : "mt-6"} text-3xl font-bold leading-tight sm:text-4xl`}
          >
            {prospect.coverHeadline}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/90">
            {prospect.coverSubhead}
          </p>
        </div>
      </header>

      <section className="sales-kit-print-unit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-[var(--geaux-charcoal)]">The revenue opportunity</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{prospect.revenueLead}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {prospect.revenueStats.map((stat) => (
            <RevenueStat key={stat.label} {...stat} />
          ))}
        </div>
        {prospect.revenueFootnote ? (
          <p className="mt-4 text-xs text-slate-500">{prospect.revenueFootnote}</p>
        ) : null}
      </section>

      {prospect.showCateringSection ? <RestaurantCateringProspectSection /> : null}

      <section className="sales-kit-print-unit rounded-2xl bg-[var(--geaux-cream)] p-6 ring-1 ring-slate-200">
        <h2 className="text-xl font-bold text-[var(--geaux-charcoal)]">Why restaurants win</h2>
        <ul className="mt-4 space-y-3 text-sm text-slate-700">
          {prospect.whyWinBullets.map((b) => (
            <Bullet key={b.title}>
              <strong>{b.title}</strong> — {b.body}
            </Bullet>
          ))}
        </ul>
      </section>

      <RestaurantSalesKitOrderPreview sample={orderPreview} />

      <section className="sales-kit-print-flow">
        <div className="sales-kit-print-unit mb-4">
          <h2 className="text-xl font-bold text-[var(--geaux-charcoal)]">At a glance</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-4">
          {atAGlance.map(([n, t, d]) => (
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
      </section>

      <section className="sales-kit-print-flow space-y-6 print:space-y-0">
        <div className="sales-kit-print-unit">
          <h2 className="text-xl font-bold text-[var(--geaux-charcoal)]">
            Emails you actually receive
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Samples of the operational emails partners get—wording and timing are configured in
            onboarding.
          </p>
        </div>
        {emailSamples.map((sample) => (
          <EmailSampleFrame
            key={sample.id}
            title={sample.title}
            when={sample.when}
            pitch={sample.pitch}
            html={getRestaurantSalesKitEmailHtml(sample.id, prospectId)}
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
            Ratings tied to real orders—feedback from people who actually ate that day.
          </p>
        </div>
        <div className="sales-kit-print-unit">
          <ReviewScreenMock />
        </div>
      </section>

      <RestaurantSalesKitOnboardingTeaser />

      <section className="sales-kit-print-unit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-[var(--geaux-charcoal)]">Next step</h2>
        <p className="mt-3 text-sm text-slate-700">
          If office lunch rotation fits your kitchen, we will schedule a kickoff and map your first
          rotation day.
        </p>
        <p className="mt-6 rounded-lg bg-[var(--geaux-red)] px-4 py-3 text-center text-sm font-semibold text-white">
          {BRAND.supportEmail} · {BRAND.name}
        </p>
      </section>
    </article>
  );
}

function atAGlanceSteps(): [string, string, string][] {
  return [
    ["1", "Kickoff", "Menu and rotation planning with your specialist."],
    ["2", "Order", "Customers order online before lunch day."],
    ["3", "Fulfill", "Print the list, pack, deliver once."],
    ["4", "Repeat", "Offices reorder when lunch lands well."],
  ];
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
