import { formatCents } from "@/lib/money/format";
import type { RestaurantCheckStub } from "@/lib/accounting/restaurant-settlement";
import { BRAND } from "@/lib/brand";

export function RestaurantCheckStubView({ stub }: { stub: RestaurantCheckStub }) {
  const commissionPct = (stub.commissionBps / 100).toFixed(2);

  return (
    <div className="mx-auto max-w-md rounded-xl border-2 border-slate-900 bg-white font-mono text-sm shadow-md">
      <div className="border-b-2 border-slate-900 px-4 py-3 text-center">
        <p className="text-xs font-bold uppercase tracking-widest">{BRAND.name} check stub</p>
        <p className="mt-1 text-lg font-bold">{stub.restaurantName}</p>
        {stub.restaurantAddress ? (
          <p className="text-xs text-slate-600">{stub.restaurantAddress}</p>
        ) : null}
        <p className="mt-2 text-xs font-semibold">Period: {stub.period.label}</p>
      </div>

      <div className="space-y-1 px-4 py-3">
        <StubRow label="Restaurant of the Day orders" value={String(stub.orderCount)} bold />
        <div className="my-2 border-t border-slate-300" />
        <StubRow label="Subtotal" value={formatCents(stub.subtotalCents)} />
        <StubRow label="Tip / gratuity" value={formatCents(stub.gratuityCents)} />
        <StubRow label="Delivery ($0.00)" value={formatCents(stub.deliveryCents)} />
        <StubRow label="Tax" value={formatCents(stub.taxCents)} />
        <StubRow label="Gross sales" value={formatCents(stub.grossSalesCents)} bold />
        <div className="my-2 border-t border-slate-300" />
        <StubRow
          label={`${BRAND.name} commission (${commissionPct}%)`}
          value={`−${formatCents(stub.commissionCents)}`}
        />
        <StubRow label="Est. card processing" value={`−${formatCents(stub.stripeFeeCents)}`} />
        <StubRow label="Check total" value={formatCents(stub.checkTotalCents)} bold />
      </div>
      <p className="border-t border-slate-200 px-4 py-2 text-center text-[10px] text-slate-500">
        Weekly payout — amounts based on paid orders in this period.
      </p>
    </div>
  );
}

function StubRow({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className={`flex justify-between gap-4 ${bold ? "font-bold" : ""}`}>
      <span className="text-slate-700">{label}</span>
      <span className="shrink-0 text-right">{value}</span>
    </div>
  );
}
