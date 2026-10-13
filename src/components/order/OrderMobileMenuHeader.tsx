"use client";

/** Sticky cart entry at top of menu column (mobile/tablet). */
export function OrderMobileMenuHeader({
  itemCount,
  totalLabel,
  onOpenCart,
}: {
  itemCount: number;
  totalLabel: string;
  onOpenCart: () => void;
}) {
  return (
    <div className="xl:hidden -mx-4 mb-2 px-4">
      <button
        type="button"
        onClick={onOpenCart}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm active:scale-[0.99]"
      >
        <div>
          <p className="text-sm font-bold text-slate-900">Your cart</p>
          <p className="text-xs text-slate-500">
            {itemCount > 0
              ? `${itemCount} item${itemCount === 1 ? "" : "s"} · ${totalLabel}`
              : "Add items from the menu below"}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-[var(--geaux-red)] px-3 py-1.5 text-xs font-bold text-white">
          {itemCount > 0 ? "View" : "Empty"}
        </span>
      </button>
    </div>
  );
}
