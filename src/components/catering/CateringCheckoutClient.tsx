"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MarketingSiteHeader } from "@/components/marketing/MarketingSiteHeader";
import { CateringCartProvider, useCateringCart } from "@/components/catering/CateringCartContext";
import { formatCents } from "@/lib/catering/cart-types";
import { formatLeadTime } from "@/lib/catering/load";
import { BRAND } from "@/lib/brand";
import type { Restaurant } from "@/types/database";

function CheckoutInner({
  restaurant,
  signedInHref,
}: {
  restaurant: Restaurant;
  signedInHref?: string | null;
}) {
  const { cart, subtotalCents, deliveryFeeCents, totalCents, servesTotal, meetsMinimum, clearCart } =
    useCateringCart();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const leadOk = useMemo(() => {
    if (!cart.event.eventDate) return false;
    const event = new Date(`${cart.event.eventDate}T${cart.event.eventTime || "12:00"}`);
    const min = new Date();
    min.setHours(min.getHours() + (restaurant.catering_lead_hours ?? 24));
    return event.getTime() >= min.getTime();
  }, [cart.event.eventDate, cart.event.eventTime, restaurant.catering_lead_hours]);

  const wrongRestaurant =
    cart.restaurantId != null && cart.restaurantId !== restaurant.id;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (wrongRestaurant) {
      setError("Your cart is for a different restaurant. Go back and rebuild the cart.");
      return;
    }
    if (!cart.lines.length) {
      setError("Your cart is empty.");
      return;
    }
    if (!meetsMinimum) {
      setError("Order is below the restaurant minimum.");
      return;
    }
    if (!leadOk) {
      setError(
        `This restaurant needs about ${formatLeadTime(restaurant.catering_lead_hours ?? 24)}. Pick a later date/time.`
      );
      return;
    }
    if (cart.event.fulfillment === "delivery" && !cart.event.address.trim()) {
      setError("Enter a delivery address.");
      return;
    }
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError("Name, email, and phone are required.");
      return;
    }

    if (!restaurant.catering_live_orders) {
      setSubmitted(true);
      return;
    }

    // Live payment path reserved until catering orders are enabled for this partner.
    setError(
      "Live catering checkout is not fully enabled for this restaurant yet. Contact us to place the order."
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen">
        <MarketingSiteHeader signedInHref={signedInHref} />
        <main className="mx-auto max-w-lg px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Demo request recorded locally</h1>
          <p className="mt-3 text-slate-600">
            This catalog is not accepting live payments. No charge was made and no kitchen ticket
            was sent. Contact{" "}
            <a className="font-semibold text-[var(--geaux-red)]" href={`mailto:${BRAND.supportEmail}`}>
              {BRAND.supportEmail}
            </a>{" "}
            when you&apos;re ready for a real catering order.
          </p>
          <button
            type="button"
            className="mt-6 rounded-full bg-[var(--geaux-red)] px-5 py-3 text-sm font-bold text-white"
            onClick={() => {
              clearCart();
              setSubmitted(false);
            }}
          >
            Clear cart
          </button>
          <p className="mt-4">
            <Link href={`/catering/${restaurant.slug}`} className="text-sm text-[var(--geaux-red)] hover:underline">
              Back to menu
            </Link>
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <MarketingSiteHeader signedInHref={signedInHref} />
      {!restaurant.catering_live_orders ? (
        <div className="bg-amber-500 px-4 py-2 text-center text-sm font-semibold text-amber-950">
          Demo mode — payment and kitchen fulfillment are disabled.
        </div>
      ) : null}
      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-2">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Checkout</h1>
          <p className="mt-1 text-slate-600">{restaurant.name}</p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <label className="block text-sm font-semibold text-slate-700">
              Contact name
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Email
              <input
                type="email"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Phone
              <input
                type="tel"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </label>

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <p>
                <strong>{cart.event.fulfillment === "delivery" ? "Delivery" : "Pickup"}</strong> ·{" "}
                {cart.event.eventDate} {cart.event.eventTime} · {cart.event.guestCount} guests
              </p>
              {cart.event.address ? <p className="mt-1">{cart.event.address}</p> : null}
              {cart.event.zip ? <p>ZIP {cart.event.zip}</p> : null}
              <p className="mt-2 text-xs text-slate-500">
                Lead time: {formatLeadTime(restaurant.catering_lead_hours ?? 24)}
                {!leadOk ? " — selected time may be too soon." : ""}
              </p>
            </div>

            {error ? (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
            ) : null}

            <button
              type="submit"
              className="w-full rounded-full bg-[var(--geaux-red)] px-5 py-3 text-sm font-bold text-white hover:bg-[var(--geaux-red-dark)]"
            >
              {restaurant.catering_live_orders
                ? "Place catering order"
                : "Confirm demo request (no charge)"}
            </button>
            <p className="text-center text-xs text-slate-500">
              <Link href={`/catering/${restaurant.slug}`} className="hover:underline">
                ← Back to menu
              </Link>
            </p>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm h-fit">
          <h2 className="font-bold text-slate-900">Order summary</h2>
          {!cart.lines.length || wrongRestaurant ? (
            <p className="mt-3 text-sm text-slate-500">
              No items for this restaurant.{" "}
              <Link href={`/catering/${restaurant.slug}`} className="text-[var(--geaux-red)] hover:underline">
                Browse the menu
              </Link>
              .
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {cart.lines.map((l) => (
                <li key={l.key} className="flex justify-between gap-3 py-2 text-sm">
                  <span>
                    {l.quantity}× {l.name}
                  </span>
                  <span className="font-medium">{formatCents(l.unitPriceCents * l.quantity)}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 space-y-1 border-t border-slate-100 pt-3 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCents(subtotalCents)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Delivery fee</span>
              <span>
                {cart.event.fulfillment === "delivery"
                  ? deliveryFeeCents > 0
                    ? formatCents(deliveryFeeCents)
                    : "None configured"
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Est. servings</span>
              <span>{servesTotal || "—"}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>{formatCents(totalCents)}</span>
            </div>
            <p className="text-xs text-slate-500">
              Tax calculated when live payment is enabled. Minimum{" "}
              {restaurant.catering_min_order_cents != null
                ? formatCents(restaurant.catering_min_order_cents)
                : "n/a"}
              {!meetsMinimum ? " — not yet met." : "."}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export function CateringCheckoutClient(props: {
  restaurant: Restaurant;
  signedInHref?: string | null;
}) {
  return (
    <CateringCartProvider>
      <CheckoutInner {...props} />
    </CateringCartProvider>
  );
}
