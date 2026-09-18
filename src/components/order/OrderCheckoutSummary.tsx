import { formatCents } from "@/lib/money/format";
import type { FeeBreakdown } from "@/lib/fees/calculate";
import { serviceFeeLabel } from "@/lib/fees/calculate";
import type { PlatformSettings } from "@/types/database";

export function OrderCheckoutSummary({
  breakdown,
  feeSettings,
  emphasized = false,
}: {
  breakdown: FeeBreakdown;
  feeSettings: Pick<
    PlatformSettings,
    "platform_fee_type" | "flat_fee_cents" | "percentage_bps"
  >;
  emphasized?: boolean;
}) {
  const boxClass = emphasized
    ? "rounded-xl border-2 border-[var(--geaux-yellow)] bg-[var(--geaux-cream)] p-4"
    : "space-y-1 text-sm";

  return (
    <div className={boxClass}>
      {emphasized ? (
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--geaux-red)]">
          You will pay
        </p>
      ) : null}
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-600">Food subtotal</span>
          <span>{formatCents(breakdown.subtotalCents)}</span>
        </div>
        {breakdown.platformFeeCents > 0 ? (
          <div className="flex justify-between gap-2">
            <span className="text-slate-600">{serviceFeeLabel(feeSettings, breakdown.entreeCount)}</span>
            <span className="shrink-0 font-medium">{formatCents(breakdown.platformFeeCents)}</span>
          </div>
        ) : null}
        {breakdown.taxCents > 0 ? (
          <div className="flex justify-between">
            <span className="text-slate-600">Tax</span>
            <span>{formatCents(breakdown.taxCents)}</span>
          </div>
        ) : null}
        <div
          className={`flex justify-between border-t border-slate-200 pt-2 ${emphasized ? "text-lg" : "text-base"} font-bold`}
        >
          <span>Total due</span>
          <span className="text-[var(--geaux-red)]">{formatCents(breakdown.totalCents)}</span>
        </div>
      </div>
      {emphasized ? (
        <p className="mt-3 text-xs text-slate-600">
          This is the exact amount charged to your card in Stripe — food plus service fees shown above.
        </p>
      ) : null}
    </div>
  );
}
