"use client";

import { OrderCheckoutSummary } from "@/components/order/OrderCheckoutSummary";
import type { FeeBreakdown } from "@/lib/fees/calculate";
import { formatCents } from "@/lib/money/format";
import { Button, SuccessMessage } from "@/components/ui";
import type { PlatformSettings } from "@/types/database";

export type OrderCartLineView = {
  lineKey: string;
  quantity: number;
  name: string;
  modifierLabel: string | null;
  lineTotal: number;
};

function GratuityPicker({
  valueCents,
  onChange,
  compact = false,
}: {
  valueCents: number;
  onChange: (cents: number) => void;
  compact?: boolean;
}) {
  const presets = [0, 100, 200, 300];
  return (
    <div className={compact ? "space-y-1" : "space-y-2"}>
      <p className="text-sm font-medium text-slate-700">Optional gratuity</p>
      <div className="flex flex-wrap gap-2">
        {presets.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all active:scale-95 ${
              valueCents === c
                ? "border-[var(--geaux-red)] bg-red-50 text-[var(--geaux-red)]"
                : "border-slate-200 bg-white text-slate-700"
            }`}
          >
            {c === 0 ? "None" : formatCents(c)}
          </button>
        ))}
      </div>
    </div>
  );
}

export function OrderCartPanel({
  cartLines,
  cartNotice,
  restaurantNote,
  gratuityCents,
  onGratuityChange,
  feePreview,
  feeSettings,
  previewMode,
  isPending,
  onCheckout,
  showCheckoutButton = true,
}: {
  cartLines: OrderCartLineView[];
  cartNotice: string | null;
  restaurantNote: string;
  gratuityCents: number;
  onGratuityChange: (cents: number) => void;
  feePreview: FeeBreakdown | null;
  feeSettings: Pick<
    PlatformSettings,
    "platform_fee_type" | "flat_fee_cents" | "percentage_bps" | "sales_tax_bps"
  >;
  previewMode?: boolean;
  isPending?: boolean;
  onCheckout?: () => void;
  showCheckoutButton?: boolean;
}) {
  return (
    <>
      {cartNotice ? (
        <div className="mb-3">
          <SuccessMessage message={cartNotice} />
        </div>
      ) : null}
      {cartLines.length === 0 ? (
        <p className="text-sm text-slate-500">Pick something tasty — use + on menu items to add.</p>
      ) : (
        <div className="space-y-4">
          {cartLines.map((l) => (
            <div key={l.lineKey} className="flex justify-between gap-3 text-sm">
              <span>
                {l.quantity}× {l.name}
                {l.modifierLabel ? (
                  <span className="block text-xs text-slate-500">{l.modifierLabel}</span>
                ) : null}
              </span>
              <span className="shrink-0">{formatCents(l.lineTotal)}</span>
            </div>
          ))}
          {restaurantNote.trim() ? (
            <p className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              <span className="font-semibold text-slate-700">Restaurant note:</span>{" "}
              {restaurantNote.trim()}
            </p>
          ) : null}
          <GratuityPicker valueCents={gratuityCents} onChange={onGratuityChange} compact />
          {feePreview ? (
            <OrderCheckoutSummary breakdown={feePreview} feeSettings={feeSettings} />
          ) : null}
          <p className="text-xs text-slate-500">
            Total due is what Stripe charges — food, service fees, and optional gratuity.
          </p>
          {showCheckoutButton ? (
            previewMode ? (
              <p className="text-xs text-amber-800">Checkout disabled in preview.</p>
            ) : (
              <Button className="w-full" size="lg" loading={isPending} onClick={onCheckout}>
                Checkout
              </Button>
            )
          ) : null}
        </div>
      )}
    </>
  );
}
