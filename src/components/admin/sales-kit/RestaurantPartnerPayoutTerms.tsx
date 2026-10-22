import { BRAND } from "@/lib/brand";
import { RESTAURANT_PARTNER_SERVICE_FEE_LINE } from "@/lib/partner/partner-fee-copy";

/** Payout + service fee explanation for restaurant sales packet. */
export function RestaurantPartnerPayoutTerms() {
  return (
    <section className="sales-kit-print-flow space-y-5 print:space-y-0">
      <div className="sales-kit-print-unit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-bold text-[var(--geaux-charcoal)]">
          Weekly payout — how the check adds up
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          You set menu prices on {BRAND.name}—usually with a small adjustment so a platform service fee
          is covered in what offices pay. We pay you weekly. Settlement works like this:
        </p>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-slate-700">
          <li>
            <strong>Food sales</strong> — what employees paid for menu items at your listed prices.
          </li>
          <li>
            <strong>Sales tax</strong> — collected at checkout and <strong>set aside</strong> in
            settlement for you to remit.
          </li>
          <li>
            <strong>{BRAND.name} service fee</strong> — shown on the stub; partners typically offset
            this through menu price adjustment rather than treating it as a separate take from the
            kitchen.
          </li>
          <li>
            <strong>Check total</strong> — food sales <strong>− service fee + tax</strong> (+ tips if
            any). Customer checkout fees on the employee order are separate from your menu total.
          </li>
        </ol>
      </div>

      <div className="sales-kit-print-unit rounded-2xl border border-slate-300 bg-slate-50 p-5">
        <h4 className="text-sm font-bold uppercase tracking-wide text-slate-800">
          In plain terms
        </h4>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          {RESTAURANT_PARTNER_SERVICE_FEE_LINE} Sales tax is pass-through. The sample stub and Friday
          weekly email match Admin → Payouts.
        </p>
      </div>
    </section>
  );
}
