import { BRAND } from "@/lib/brand";

/** Commission + sales tax explanation for restaurant sales packet. */
export function RestaurantPartnerPayoutTerms() {
  return (
    <section className="sales-kit-section space-y-5 break-inside-avoid">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-bold text-[var(--geaux-charcoal)]">
          Payouts: 12% commission & sales tax
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Each paid office lunch order flows through your weekly check stub in this order:
        </p>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-slate-700">
          <li>
            <strong>Food subtotal</strong> — menu items only (your prices).
          </li>
          <li>
            <strong>Sales tax</strong> — collected at checkout on those food sales (before we calculate
            commission).
          </li>
          <li>
            <strong>{BRAND.name} commission — 12% of tax-inclusive food sales</strong> — withheld from
            payout. The base is food subtotal <em>with</em> sales tax included (see gross sales on the
            sample stub).
          </li>
          <li>
            <strong>Check total</strong> — food subtotal <strong>− commission + tax</strong> (+ tips if
            any). Tax is settled to you for remittance; commission is not assessed on customer service
            fees.
          </li>
        </ol>
      </div>

      <div className="rounded-2xl border border-slate-300 bg-slate-50 p-5">
        <h4 className="text-sm font-bold uppercase tracking-wide text-slate-800">
          Commission base
        </h4>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          Sales tax is applied to the order first. {BRAND.name} then calculates{" "}
          <strong>12% commission on the tax-inclusive food total</strong> (subtotal and sales tax
          together). That matches <strong>gross food sales</strong> on your stub — not service fees or
          tips. Your Friday email and Admin → Payouts use the same math.
        </p>
      </div>
    </section>
  );
}
