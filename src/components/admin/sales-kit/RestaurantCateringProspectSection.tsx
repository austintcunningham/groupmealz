import { BRAND } from "@/lib/brand";

/** Catering positioning for high-volume QSR prospects (e.g. Chick-fil-A). */
export function RestaurantCateringProspectSection() {
  return (
    <section className="sales-kit-print-unit rounded-2xl border-2 border-[var(--geaux-red)]/30 bg-white p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--geaux-red)]">
        Why lead with catering
      </p>
      <h2 className="mt-2 text-xl font-bold text-[var(--geaux-charcoal)]">
        Corporate catering is the easy yes—office lunch is the long game
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        Many high-volume stores already trust their catering program. {BRAND.name} feeds it with
        offices that book trays and platters ahead, pay online, and show up on a calendar—not as a
        day-of phone call. Office lunch rotation is the second chapter: same partnership, bigger
        labeled-meal days when the store is ready.
      </p>
      <p className="mt-4 rounded-lg bg-[var(--geaux-cream)] px-4 py-3 text-sm text-slate-700">
        Catering and office lunch are separate in the product. How each one is set up for your store
        is part of onboarding—not something you need from this overview.
      </p>
    </section>
  );
}
