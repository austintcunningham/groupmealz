import { BRAND } from "@/lib/brand";

/** Short onboarding promise for sales packets—details come in kickoff, not the deck. */
export function RestaurantSalesKitOnboardingTeaser() {
  return (
    <section className="sales-kit-print-unit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-[var(--geaux-charcoal)]">If we move forward</h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        A {BRAND.name} onboarding specialist handles setup with you—menu, kitchen contacts, delivery
        rhythm, and how settlement works. You do not need to memorize policy from this overview.
      </p>
      <ul className="mt-4 space-y-2 text-sm text-slate-700">
        <li>Kickoff call and menu upload</li>
        <li>Kitchen email, branding, and first rotation day on the calendar</li>
        <li>Fulfillment tune-up after your first office lunch</li>
      </ul>
    </section>
  );
}
