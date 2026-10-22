import { BRAND } from "@/lib/brand";

/** Catering positioning for high-volume QSR prospects (e.g. Chick-fil-A). */
export function RestaurantCateringProspectSection() {
  return (
    <section className="sales-kit-print-unit rounded-2xl border-2 border-[var(--geaux-red)]/30 bg-white p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--geaux-red)]">
        {BRAND.name} catering for offices
      </p>
      <h2 className="mt-2 text-xl font-bold text-[var(--geaux-charcoal)]">
        The foot in the door: corporate catering, already wired into the same flow
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        Offices do not only order one sandwich at a time — they need{" "}
        <strong>trays for all-hands meetings</strong>, <strong>boxed lunches for training days</strong>,
        and <strong>labeled individual meals</strong> for the rest of the building on the same lunch
        rotation. {BRAND.name} treats catering as a first-class part of the product: office admins add
        catering SKUs at checkout, employees still order their own meals, and your store receives{" "}
        <strong>one prepaid manifest</strong> after cutoff.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <CateringCard
          title="What offices can order today"
          items={[
            "Nuggets, strips, and mini trays with sauces",
            "Sandwich platters and boxed meal packages",
            "Sides, salads, and beverages at tray scale",
            "Individual meals with modifiers — on the same lunch day",
          ]}
        />
        <CateringCard
          title="Why operators like it"
          items={[
            "Cutoff locks tray counts before prep — no day-of phone tag",
            "Catering lines sit on the same kitchen email as labeled bags",
            "Prepaid — no invoicing chase or card-at-the-door",
            "Delivery window published up front for driver planning",
          ]}
        />
      </div>

      <p className="mt-5 rounded-lg bg-[var(--geaux-cream)] px-4 py-3 text-sm text-slate-700">
        <strong>Pilot-friendly:</strong> Start with one corporate account and catering-heavy days.
        When fulfillment is smooth, expand rotation to additional offices — volume scales without
        adding register complexity.
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
