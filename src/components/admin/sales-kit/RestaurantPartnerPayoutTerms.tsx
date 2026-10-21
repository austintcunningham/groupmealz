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
            <strong>Sales tax</strong> — collected at checkout and included in settlement; you remit
            to tax authorities.
          </li>
          <li>
            <strong>{BRAND.name} commission — 12% of food subtotal + tax</strong> — withheld before
            payout (see line item on the sample stub below).
          </li>
          <li>
            <strong>Check total</strong> — food subtotal + tax (+ tips if any) − commission. Customer
            service fees paid to {BRAND.name} are separate from your food sales.
          </li>
        </ol>
      </div>

      <div className="rounded-2xl border border-slate-300 bg-slate-50 p-5">
        <h4 className="text-sm font-bold uppercase tracking-wide text-slate-800">
          Commission base
        </h4>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          {BRAND.name} calculates the <strong>12% partner commission on food subtotal plus sales tax</strong>{" "}
          for each order — not on customer service fees or tips. Your stub and Friday weekly email show
          the same math as Admin → Payouts.
        </p>
      </div>
    </section>
  );
}
