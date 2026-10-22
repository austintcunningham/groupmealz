import { BRAND } from "@/lib/brand";

/** Catering positioning for high-volume QSR prospects (e.g. Chick-fil-A). */
export function RestaurantCateringProspectSection() {
  return (
    <section className="sales-kit-print-unit rounded-2xl border-2 border-[var(--geaux-red)]/30 bg-white p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--geaux-red)]">
        {BRAND.name} catering — separate from office lunch
      </p>
      <h2 className="mt-2 text-xl font-bold text-[var(--geaux-charcoal)]">
        Corporate catering as its own channel (your foot in the door)
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        Catering is <strong>not</strong> added to rotation-day lunch checkout. Offices use a{" "}
        <strong>dedicated catering order flow</strong> with <strong>different cutoffs and lead
        times</strong> — built so stores receive tray totals and setup notes{" "}
        <strong>days before</strong> the event. That is the wedge for operators who already know
        catering: prepaid corporate demand, without surprise tray counts landing the morning of office
        lunch.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <CateringCard
          title="Office lunch rotation"
          items={[
            "Employees order individual meals on a short window",
            "Morning cutoff → kitchen order list same day",
            "120–200+ labeled bags on big rotation days",
            "Separate email, separate rules from catering",
          ]}
        />
        <CateringCard
          title="Corporate catering"
          items={[
            "Office admin orders trays, platters, boxed meals only on catering flow",
            "Longer lead time — order locks days before delivery",
            "Catering production sheet when the order confirms",
            "Own delivery date/time — prep scheduled in advance",
          ]}
        />
      </div>

      <p className="mt-5 rounded-lg bg-[var(--geaux-cream)] px-4 py-3 text-sm text-slate-700">
        <strong>Pilot path:</strong> Lead with one corporate catering account to prove prep and
        delivery. Add office lunch rotation when the store is ready for recurring labeled-meal volume
        — still on its own schedule and cutoff, never mixed with catering cart logic.
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
