"use client";

import Link from "next/link";
import { formatCents } from "@/lib/catering/cart-types";
import { useCateringCart } from "@/components/catering/CateringCartContext";

export function CateringCartSummary({ checkoutHref }: { checkoutHref: string }) {
  const {
    cart,
    subtotalCents,
    deliveryFeeCents,
    totalCents,
    servesTotal,
    meetsMinimum,
    updateQty,
    removeLine,
  } = useCateringCart();

  if (!cart.lines.length) {
    return <p className="text-sm text-slate-500">Your catering cart is empty.</p>;
  }

  const remaining =
    cart.minOrderCents != null && !meetsMinimum
      ? cart.minOrderCents - subtotalCents
      : 0;

  return (
    <div className="space-y-4">
      {!cart.liveOrders ? (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900">
          Demo catalog — live checkout is disabled for this restaurant.
        </p>
      ) : null}
      <ul className="divide-y divide-slate-100">
        {cart.lines.map((line) => (
          <li key={line.key} className="flex gap-3 py-3">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-slate-900">{line.name}</p>
              <p className="text-xs text-slate-500">
                {formatCents(line.unitPriceCents)}
                {line.servesEach ? ` · serves ${line.servesEach}` : ""}
              </p>
              {line.specialInstructions ? (
                <p className="mt-1 text-xs italic text-slate-500">
                  {line.specialInstructions}
                </p>
              ) : null}
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  className="h-7 w-7 rounded-md border border-slate-200 text-sm"
                  onClick={() => updateQty(line.key, line.quantity - 1)}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-6 text-center text-sm font-semibold">{line.quantity}</span>
                <button
                  type="button"
                  className="h-7 w-7 rounded-md border border-slate-200 text-sm"
                  onClick={() => updateQty(line.key, line.quantity + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
                <button
                  type="button"
                  className="ml-auto text-xs text-slate-500 hover:text-red-600"
                  onClick={() => removeLine(line.key)}
                >
                  Remove
                </button>
              </div>
            </div>
            <p className="shrink-0 text-sm font-semibold">
              {formatCents(line.unitPriceCents * line.quantity)}
            </p>
          </li>
        ))}
      </ul>

      <div className="space-y-1 border-t border-slate-100 pt-3 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCents(subtotalCents)}</span>
        </div>
        {cart.event.fulfillment === "delivery" ? (
          <div className="flex justify-between text-slate-600">
            <span>Delivery fee</span>
            <span>
              {deliveryFeeCents > 0 ? formatCents(deliveryFeeCents) : "TBD / none set"}
            </span>
          </div>
        ) : null}
        <div className="flex justify-between text-slate-600">
          <span>Est. servings</span>
          <span>{servesTotal || "—"}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span>{formatCents(totalCents)}</span>
        </div>
        <p className="text-xs text-slate-500">
          Taxes shown at checkout when configured. Fees are never invented.
        </p>
      </div>

      {remaining > 0 ? (
        <p className="text-xs font-medium text-amber-800">
          Add {formatCents(remaining)} more to meet the {formatCents(cart.minOrderCents!)} minimum.
        </p>
      ) : null}

      <p className="text-xs text-slate-500">
        {cart.event.fulfillment === "delivery" ? "Delivery" : "Pickup"} · {cart.event.eventDate}{" "}
        {cart.event.eventTime} · {cart.event.guestCount} guests
      </p>

      <Link
        href={checkoutHref}
        className={`block rounded-full px-4 py-3 text-center text-sm font-bold ${
          meetsMinimum
            ? "bg-[var(--geaux-red)] text-white hover:bg-[var(--geaux-red-dark)]"
            : "pointer-events-none bg-slate-200 text-slate-500"
        }`}
      >
        {cart.liveOrders ? "Checkout" : "Review order (demo)"}
      </Link>
    </div>
  );
}

export function CateringMobileCartBar() {
  const { itemCount, subtotalCents, setDrawerOpen, cart } = useCateringCart();
  if (!itemCount) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white p-3 shadow-lg xl:hidden">
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        className="flex w-full items-center justify-between rounded-full bg-[var(--geaux-red)] px-5 py-3 text-sm font-bold text-white"
      >
        <span>View cart · {itemCount} item{itemCount === 1 ? "" : "s"}</span>
        <span>{formatCents(subtotalCents)}</span>
      </button>
      {!cart.liveOrders ? (
        <p className="mt-1 text-center text-[11px] text-amber-800">Demo — orders disabled</p>
      ) : null}
    </div>
  );
}

export function CateringCartDrawer({ checkoutHref }: { checkoutHref: string }) {
  const { drawerOpen, setDrawerOpen, cart } = useCateringCart();
  if (!drawerOpen) return null;
  return (
    <div className="fixed inset-0 z-40 xl:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close cart"
        onClick={() => setDrawerOpen(false)}
      />
      <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">
            {cart.restaurantName ? `${cart.restaurantName} cart` : "Catering cart"}
          </h2>
          <button
            type="button"
            className="text-sm text-slate-500"
            onClick={() => setDrawerOpen(false)}
          >
            Close
          </button>
        </div>
        <CateringCartSummary checkoutHref={checkoutHref} />
      </div>
    </div>
  );
}
