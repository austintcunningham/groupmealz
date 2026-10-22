import { BRAND } from "@/lib/brand";

/** Catering positioning for high-volume QSR prospects (e.g. Chick-fil-A). */
export function RestaurantCateringProspectSection() {
  return (
    <section className="sales-kit-print-unit rounded-2xl border-2 border-[var(--geaux-red)]/30 bg-white p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--geaux-red)]">
        Corporate catering
      </p>
      <h2 className="mt-2 text-xl font-bold text-[var(--geaux-charcoal)]">
        A separate catering program—not bolted onto office lunch
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        Offices do not add catering while employees are ordering lunch. Catering has its own order,
        cutoff, and lead time, and you receive tray totals and setup notes while there is still time
        to prep. For stores that already do catering, this is an easy first conversation: corporate
        jobs that are paid upfront, with dates on the calendar instead of day-of phone calls.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <CateringCard
          title="Office lunch rotation"
          items={[
            "Employees order individual meals on a short window",
            "Cutoff the morning of delivery, then the kitchen order list goes out",
            "Often 120–200+ labeled bags on large rotation days",
            "Different cutoff, different kitchen email than catering",
          ]}
        />
        <CateringCard
          title="Corporate catering"
          items={[
            "Office admin orders trays and platters on the catering flow only",
            "Order closes days before delivery",
            "Production sheet when the order is final",
            "Delivery date and time set up front for scheduling",
          ]}
        />
      </div>

      <p className="mt-5 rounded-lg bg-[var(--geaux-cream)] px-4 py-3 text-sm text-slate-700">
        <strong>How we usually start:</strong> One catering account and one event with enough lead
        time. When that runs smoothly, add office lunch rotation—or more catering accounts—without
        combining the two order types.
      </p>
    </section>
  );
}

function CateringCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-[var(--geaux-cream)]/60 p-4">
      <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm text-slate-700">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--geaux-yellow)]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
