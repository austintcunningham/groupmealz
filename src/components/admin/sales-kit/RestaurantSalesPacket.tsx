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
import { RestaurantPartnerPlaybook } from "./RestaurantPartnerPlaybook";
import { RestaurantPartnerPayoutTerms } from "./RestaurantPartnerPayoutTerms";
import { RestaurantSalesTaxNotice } from "./RestaurantSalesTaxNotice";
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
  const atAGlance = atAGlanceSteps(prospectId);

  return (
    <article className="sales-kit-document mx-auto max-w-3xl space-y-8 pb-12 print:space-y-0 print:pb-0">
      <header className="sales-kit-cover break-inside-avoid overflow-hidden rounded-2xl geaux-header-gradient text-white shadow-lg print:rounded-none print:shadow-none">
        <div className="geaux-accent-bar" />
        <div className="px-8 py-10 text-center print:px-4 print:py-4">
          <div className="flex justify-center">
            <GroupMealsLogo size="md" href={undefined} surface="light" />
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
            {prospect.coverEyebrow}
          </p>
          <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">{prospect.coverHeadline}</h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/90">
            {prospect.coverSubhead}
          </p>
        </div>
      </header>

      <section className="sales-kit-print-unit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-[var(--geaux-charcoal)]">
          {prospectId === "chick-fil-a" ? "What the volume looks like" : "The revenue opportunity"}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{prospect.revenueLead}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {prospect.revenueStats.map((stat) => (
            <RevenueStat key={stat.label} {...stat} />
          ))}
        </div>
        <p className="mt-4 text-xs text-slate-500">{prospect.revenueFootnote}</p>
      </section>

      {prospect.showCateringSection ? <RestaurantCateringProspectSection /> : null}

      <section className="sales-kit-print-unit rounded-2xl bg-[var(--geaux-cream)] p-6 ring-1 ring-slate-200">
        <h2 className="text-xl font-bold text-[var(--geaux-charcoal)]">
          {prospectId === "chick-fil-a" ? "Why it works for a busy store" : "Why restaurants win"}
        </h2>
        <ul className="mt-4 space-y-3 text-sm text-slate-700">
          {prospect.whyWinBullets.map((b) => (
            <Bullet key={b.title}>
              <strong>{b.title}</strong> — {b.body}
            </Bullet>
          ))}
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
        <div className="sales-kit-print-unit mt-4 text-sm text-slate-600">
          {prospectId === "chick-fil-a"
            ? "The playbook below walks through office lunch and catering separately—from catering prep with lead time to labeling rotation-day bags."
            : "The detailed partner playbook below covers onboarding through delivery — including labeling, sealing, and handoff standards."}
        </div>
      </section>

      <RestaurantPartnerPlaybook prospectId={prospectId} />

      <section className="sales-kit-print-flow space-y-6 print:space-y-0">
        <div className="sales-kit-print-unit">
          <h2 className="text-xl font-bold text-[var(--geaux-charcoal)]">
            Emails you actually receive
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Real templates from production — samples below match what partners get today
            {prospectId === "chick-fil-a" ? ", using this store and menu as the example." : "."}
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
            Ratings are tied to real orders — so you hear from people who actually ate your food
            that day, not random internet reviews.
          </p>
        </div>
        <div className="sales-kit-print-unit">
          <ReviewScreenMock />
        </div>
      </section>

      <section className="sales-kit-print-unit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-[var(--geaux-charcoal)]">
          {prospectId === "chick-fil-a" ? "Getting started" : "Getting on the rotation"}
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-700">
          {(prospectId === "chick-fil-a" ? gettingStartedChickFilA : gettingStartedDefault).map(
            (line) => (
              <li key={line}>{line}</li>
            )
          )}
        </ol>
        <p className="mt-6 rounded-lg bg-[var(--geaux-red)] px-4 py-3 text-center text-sm font-semibold text-white">
          Ready to talk? {BRAND.supportEmail} · {BRAND.name}
        </p>
      </section>
    </article>
  );
}

function atAGlanceSteps(prospectId: RestaurantProspectId): [string, string, string][] {
  if (prospectId === "chick-fil-a") {
    return [
      ["1", "Catering", "Trays ordered days ahead; production email when the order closes."],
      ["2", "Office lunch", "Rotation-day meals; morning cutoff and a separate kitchen list."],
      ["3", "Deliver", "Run catering on the booked date; labeled bags on rotation days."],
      ["4", "Grow", "Weekly settlement and reviews; add offices and catering accounts over time."],
    ];
  }
  return [
    ["1", "Get on the rotation", "Onboarding uploads your menu; you control items and pricing anytime."],
    ["2", "Employees order online", "Cutoff gives you a firm count."],
    ["3", "You get the digest", "Print the order list, pack, deliver once."],
    ["4", "We settle & improve", "Payout summaries + verified reviews."],
  ];
}

const gettingStartedDefault = [
  "Meet your onboarding specialist — we tailor menu, timing, and kitchen workflow to your operation.",
  "Share kitchen email and payout details; we configure digests and weekly summaries.",
  "Branding review so your order page looks sharp.",
  "First office day — we watch fulfillment closely and tune with your team.",
];

const gettingStartedChickFilA = [
  "Meet with onboarding to set catering lead times and cutoffs, and to confirm how much delivery you can take on—separate from office lunch.",
  "Turn on catering first: load tray and platter items, set the production email, and run one corporate event with enough notice to prep.",
  "When you are ready, add office lunch rotation: meal menu, morning cutoff, and the daily kitchen email (still separate from catering).",
  "Add more catering accounts or office rotations as both run smoothly.",
];

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
