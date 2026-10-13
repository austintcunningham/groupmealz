"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!mounted || !open) return null;

  const itemCount = cartLines.reduce((s, l) => s + l.quantity, 0);

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex flex-col justify-end xl:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Your cart"
    >
      <button
        type="button"
        className="absolute inset-0 z-0 bg-slate-900/35"
        aria-label="Close cart"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[min(88dvh,720px)] min-h-[min(42dvh,360px)] flex-col rounded-t-2xl bg-white shadow-[0_-8px_40px_rgba(0,0,0,0.18)]">
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-slate-200" aria-hidden />
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Your cart</h2>
            <p className="text-xs text-slate-500">
              {itemCount} item{itemCount === 1 ? "" : "s"}
              {feePreview ? ` · ${formatCents(feePreview.totalCents)} total` : null}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-sm font-semibold text-[var(--geaux-red)] hover:bg-red-50"
          >
            Close
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
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
    </div>,
    document.body
  );
}
