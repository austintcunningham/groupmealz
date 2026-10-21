import { BRAND } from "@/lib/brand";

/** Commission + sales tax explanation for restaurant sales packet. */
export function RestaurantPartnerPayoutTerms() {
  return (
    <section className="sales-kit-print-flow space-y-5 print:space-y-0">
      <div className="sales-kit-print-unit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-bold text-[var(--geaux-charcoal)]">
          Weekly payout — how the check adds up
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          You set menu prices. We pay you weekly. Before each payout, we apply sales tax and
          commission in this order:
        </p>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-slate-700">
          <li>
            <strong>Food subtotal</strong> — what employees paid for menu items (your prices).
          </li>
          <li>
            <strong>Sales tax</strong> — collected at checkout and <strong>set aside</strong> in
            settlement for you to remit (not included in our commission).
          </li>
          <li>
            <strong>{BRAND.name} commission — 12% of food subtotal</strong> — withheld from payout
            after tax is separated.
          </li>
          <li>
            <strong>Check total</strong> — food subtotal <strong>− commission + tax</strong> (+ tips if
            any). Customer service fees stay with {BRAND.name} and are not part of your food subtotal.
          </li>
        </ol>
      </div>

      <div className="sales-kit-print-unit rounded-2xl border border-slate-300 bg-slate-50 p-5">
        <h4 className="text-sm font-bold uppercase tracking-wide text-slate-800">
          In plain terms
        </h4>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          Tax is pass-through. Commission is only on the food subtotal — never on sales tax, service
          fees, or tips. The sample stub and Friday weekly email match Admin → Payouts.
        </p>
      </div>
    </section>
  );
}
