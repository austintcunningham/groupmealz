import { BRAND } from "@/lib/brand";

/** Short onboarding promise for sales packets—details come in kickoff, not the deck. */
export function RestaurantSalesKitOnboardingTeaser({
  prospectId = "default",
}: {
  prospectId?: "default" | "chick-fil-a";
}) {
  const isChickFilA = prospectId === "chick-fil-a";

  return (
    <section className="sales-kit-print-unit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-[var(--geaux-charcoal)]">If we move forward</h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        A {BRAND.name} onboarding specialist handles setup with you—menu, kitchen contacts, delivery
        rhythm, and how settlement works. You do not need to memorize policy from this overview.
      </p>
      <ul className="mt-4 space-y-2 text-sm text-slate-700">
        {isChickFilA ? (
          <>
            <li>Kickoff call and catering pilot planning</li>
            <li>Portal setup for catering and (when ready) office lunch</li>
            <li>First live office or catering day with our team on standby</li>
          </>
        ) : (
          <>
            <li>Kickoff call and menu upload</li>
            <li>Kitchen email, branding, and first rotation day on the calendar</li>
            <li>Fulfillment tune-up after your first office lunch</li>
          </>
        )}
      </ul>
    </section>
  );
}
