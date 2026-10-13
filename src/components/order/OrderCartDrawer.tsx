"use client";

import { useEffect } from "react";
import { OrderCartPanel, type OrderCartLineView } from "@/components/order/OrderCartPanel";
import type { FeeBreakdown } from "@/lib/fees/calculate";
import { formatCents } from "@/lib/money/format";
import type { PlatformSettings } from "@/types/database";

export function OrderCartDrawer({
  open,
  onClose,
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
}: {
  open: boolean;
  onClose: () => void;
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
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const itemCount = cartLines.reduce((s, l) => s + l.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 xl:hidden" role="dialog" aria-modal="true" aria-label="Your cart">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close cart"
        onClick={onClose}
      />
      <div className="absolute inset-x-0 bottom-0 max-h-[min(92vh,720px)] overflow-hidden rounded-t-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Your cart</h2>
            <p className="text-xs text-slate-500">
              {itemCount} item{itemCount === 1 ? "" : "s"}
              {feePreview ? ` · ${formatCents(feePreview.totalCents)}` : null}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-sm font-semibold text-[var(--geaux-red)] hover:bg-red-50"
          >
            Done
          </button>
        </div>
        <div className="overflow-y-auto px-4 py-4 pb-8">
          <OrderCartPanel
            cartLines={cartLines}
            cartNotice={cartNotice}
            restaurantNote={restaurantNote}
            gratuityCents={gratuityCents}
            onGratuityChange={onGratuityChange}
            feePreview={feePreview}
            feeSettings={feeSettings}
            previewMode={previewMode}
            isPending={isPending}
            onCheckout={() => {
              onClose();
              onCheckout?.();
            }}
          />
        </div>
      </div>
    </div>
  );
}
