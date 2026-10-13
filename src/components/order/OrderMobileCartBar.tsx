"use client";

import { formatCents } from "@/lib/money/format";
import { Button } from "@/components/ui";

/** Fixed thumb-zone cart access on phones — opens cart sheet. */
export function OrderMobileCartBar({
  itemCount,
  subtotalCents,
  totalCents,
  onOpenCart,
  onCheckout,
  previewMode,
  isPending,
}: {
  itemCount: number;
  subtotalCents: number;
  totalCents: number | null;
  onOpenCart: () => void;
  onCheckout: () => void;
  previewMode?: boolean;
  isPending?: boolean;
}) {
  if (itemCount <= 0) return null;

  const displayTotal = totalCents ?? subtotalCents;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[90] border-t border-slate-200/90 bg-white/98 px-4 py-3 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur-md xl:hidden pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      role="region"
      aria-label="Cart summary"
    >
      <div className="mx-auto flex max-w-6xl items-center gap-3">
        <button
          type="button"
          onClick={onOpenCart}
          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-left active:bg-slate-100"
        >
          <p className="text-sm font-bold text-slate-900">
            {itemCount} item{itemCount === 1 ? "" : "s"} · {formatCents(displayTotal)}
          </p>
          <p className="text-xs font-medium text-[var(--geaux-red)]">Tap to review cart</p>
        </button>
        {previewMode ? (
          <Button variant="secondary" size="lg" className="shrink-0" onClick={onOpenCart}>
            Preview
          </Button>
        ) : (
          <Button size="lg" className="shrink-0" loading={isPending} onClick={onCheckout}>
            Checkout
          </Button>
        )}
      </div>
    </div>
  );
}
