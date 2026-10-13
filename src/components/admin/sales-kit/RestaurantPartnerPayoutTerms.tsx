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
          Each paid office lunch order flows through your weekly check stub like this:
        </p>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-slate-700">
          <li>
            <strong>Food subtotal</strong> — menu items only (your prices).
          </li>
          <li>
            <strong>{BRAND.name} commission — 12% of food subtotal</strong> — withheld before payout
            (see line item on the sample stub below).
          </li>
          <li>
            <strong>Sales tax</strong> — collected at checkout and included in settlement; you remit
            to tax authorities.
          </li>
          <li>
            <strong>Check total</strong> — food subtotal + tax (+ tips if any) − commission. Customer
            service fees paid to {BRAND.name} are separate from your food subtotal.
          </li>
        </ol>
      </div>

      <div className="rounded-2xl border border-slate-300 bg-slate-50 p-5">
        <h4 className="text-sm font-bold uppercase tracking-wide text-slate-800">
          Commission: before or after tax?
        </h4>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          {BRAND.name} calculates the <strong>12% partner commission on the pre-tax food subtotal</strong>,
          not on sales tax and not on the customer service fee. That matches common marketplace and
          delivery-platform practice: sales tax is a pass-through amount you hold for remittance, not
          revenue the platform should share in.
        </p>
      </div>
    </section>
  );
}
