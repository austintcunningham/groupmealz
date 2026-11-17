"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MarketingSiteHeader } from "@/components/marketing/MarketingSiteHeader";
import {
  CateringCartDrawer,
  CateringCartSummary,
  CateringMobileCartBar,
} from "@/components/catering/CateringCartPanel";
import { CateringCartProvider, useCateringCart } from "@/components/catering/CateringCartContext";
import { formatCents } from "@/lib/catering/cart-types";
import { formatLeadTime, restaurantAddressLine } from "@/lib/catering/load";
import type { MenuCategory, MenuItem, Restaurant } from "@/types/database";

function EventDetailsBar({ restaurant }: { restaurant: Restaurant }) {
  const { cart, setEvent } = useCateringCart();
  const e = cart.event;
  const field =
    "rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm outline-none focus:border-[var(--geaux-red)]";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Event details</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block text-xs font-semibold text-slate-600">
          Fulfillment
          <select
            className={`mt-1 w-full ${field}`}
            value={e.fulfillment}
            onChange={(ev) =>
              setEvent({ fulfillment: ev.target.value as "delivery" | "pickup" })
            }
          >
            <option value="delivery">Delivery</option>
            <option value="pickup">Pickup</option>
          </select>
        </label>
        <label className="block text-xs font-semibold text-slate-600 sm:col-span-2">
          {e.fulfillment === "delivery" ? "Delivery address" : "Pickup notes"}
          <input
            className={`mt-1 w-full ${field}`}
            value={e.address}
            onChange={(ev) => setEvent({ address: ev.target.value })}
            placeholder={
              e.fulfillment === "delivery"
                ? "Street address"
                : `Pickup at ${restaurant.street_address || restaurant.name}`
            }
          />
        </label>
        <label className="block text-xs font-semibold text-slate-600">
          ZIP
          <input
            className={`mt-1 w-full ${field}`}
            value={e.zip}
            onChange={(ev) => setEvent({ zip: ev.target.value })}
            inputMode="numeric"
          />
        </label>
        <label className="block text-xs font-semibold text-slate-600">
          Event date
          <input
            type="date"
            className={`mt-1 w-full ${field}`}
            value={e.eventDate}
            onChange={(ev) => setEvent({ eventDate: ev.target.value })}
          />
        </label>
        <label className="block text-xs font-semibold text-slate-600">
          Event time
          <input
            type="time"
            className={`mt-1 w-full ${field}`}
            value={e.eventTime}
            onChange={(ev) => setEvent({ eventTime: ev.target.value })}
          />
        </label>
        <label className="block text-xs font-semibold text-slate-600">
          Guest count
          <input
            type="number"
            min={1}
            className={`mt-1 w-full ${field}`}
            value={e.guestCount}
            onChange={(ev) => setEvent({ guestCount: Number(ev.target.value) || 1 })}
          />
        </label>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Orders need about {formatLeadTime(restaurant.catering_lead_hours ?? 24)}. Availability is
        confirmed with the restaurant before live fulfillment.
      </p>
    </div>
  );
}

function ProductCard({ item }: { item: MenuItem }) {
  const { addLine } = useCateringCart();
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");
  const [open, setOpen] = useState(false);

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="relative aspect-[4/3] bg-gradient-to-br from-orange-50 to-slate-100">
        {item.image_url ? (
          <Image src={item.image_url} alt="" fill className="object-cover" sizes="280px" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-sm font-medium text-slate-400">
            {item.name}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-bold text-slate-900">{item.name}</h3>
        {item.description ? (
          <p className="mt-1 line-clamp-3 text-sm text-slate-600">{item.description}</p>
        ) : null}
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
          {item.catering_serves_count ? (
            <span className="rounded-full bg-slate-100 px-2 py-0.5">
              Serves {item.catering_serves_count}
            </span>
          ) : null}
          {item.catering_packaging ? (
            <span className="rounded-full bg-slate-100 px-2 py-0.5">{item.catering_packaging}</span>
          ) : null}
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <p className="text-lg font-bold text-slate-900">{formatCents(item.price_cents)}</p>
          <button
            type="button"
            className="rounded-full bg-[var(--geaux-red)] px-4 py-2 text-sm font-bold text-white hover:bg-[var(--geaux-red-dark)]"
            onClick={() => setOpen(true)}
          >
            Add
          </button>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-bold">{item.name}</h3>
            <p className="mt-1 text-sm text-slate-600">{formatCents(item.price_cents)}</p>
            <label className="mt-4 block text-xs font-semibold text-slate-600">
              Quantity
              <input
                type="number"
                min={1}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
              />
            </label>
            <label className="mt-3 block text-xs font-semibold text-slate-600">
              Special instructions
              <textarea
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes for the kitchen"
              />
            </label>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                className="flex-1 rounded-full border border-slate-200 py-2.5 text-sm font-semibold"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="flex-1 rounded-full bg-[var(--geaux-red)] py-2.5 text-sm font-bold text-white"
                onClick={() => {
                  addLine({
                    menuItemId: item.id,
                    name: item.name,
                    unitPriceCents: item.price_cents,
                    quantity: qty,
                    servesEach: item.catering_serves_count ?? null,
                    packaging: item.catering_packaging ?? null,
                    specialInstructions: notes.trim(),
                  });
                  setOpen(false);
                  setQty(1);
                  setNotes("");
                }}
              >
                Add to cart
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function CateringRestaurantInner({
  restaurant,
  categories,
  items,
  signedInHref,
}: {
  restaurant: Restaurant;
  categories: MenuCategory[];
  items: MenuItem[];
  signedInHref?: string | null;
}) {
  const { setRestaurant } = useCateringCart();
  const checkoutHref = `/catering/${restaurant.slug}/checkout`;

  useEffect(() => {
    setRestaurant({
      restaurantId: restaurant.id,
      restaurantSlug: restaurant.slug,
      restaurantName: restaurant.name,
      liveOrders: Boolean(restaurant.catering_live_orders),
      minOrderCents: restaurant.catering_min_order_cents ?? null,
      deliveryFeeCents: restaurant.catering_delivery_fee_cents ?? 0,
      leadHours: restaurant.catering_lead_hours ?? 24,
    });
  }, [restaurant, setRestaurant]);

  const byCategory = useMemo(() => {
    return categories
      .map((c) => ({
        category: c,
        items: items.filter((i) => i.category_id === c.id),
      }))
      .filter((g) => g.items.length > 0);
  }, [categories, items]);

  return (
    <div className="min-h-screen pb-24 xl:pb-8">
      <MarketingSiteHeader signedInHref={signedInHref} />

      {!restaurant.catering_live_orders ? (
        <div className="bg-amber-500 px-4 py-2 text-center text-sm font-semibold text-amber-950">
          Demo catering catalog — not available for live customer orders. Prices are illustrative
          placeholders.
        </div>
      ) : null}

      <div className="relative h-44 bg-gradient-to-br from-[var(--geaux-red)] to-red-900 sm:h-56">
        {restaurant.banner_url ? (
          <Image
            src={restaurant.banner_url}
            alt=""
            fill
            className="object-cover opacity-80"
            priority
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 mx-auto flex max-w-6xl items-end gap-4 px-4 pb-5">
          {restaurant.logo_url ? (
            <Image
              src={restaurant.logo_url}
              alt=""
              width={72}
              height={72}
              className="h-16 w-16 rounded-xl border-2 border-white bg-white object-contain shadow-md sm:h-[72px] sm:w-[72px]"
            />
          ) : null}
          <div className="text-white">
            <h1 className="text-2xl font-extrabold sm:text-3xl">{restaurant.name}</h1>
            <p className="text-sm text-white/90">{restaurantAddressLine(restaurant)}</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <p className="max-w-3xl text-slate-700">
          {restaurant.catering_description ||
            restaurant.description ||
            "Catering from a local GroupMeals partner."}
        </p>
        <ul className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
          <li className="rounded-full bg-slate-100 px-3 py-1">
            Min{" "}
            {restaurant.catering_min_order_cents != null
              ? formatCents(restaurant.catering_min_order_cents)
              : "varies"}
          </li>
          <li className="rounded-full bg-slate-100 px-3 py-1">
            {formatLeadTime(restaurant.catering_lead_hours ?? 24)}
          </li>
          <li className="rounded-full bg-slate-100 px-3 py-1">Delivery & pickup</li>
          {restaurant.catering_cuisine ? (
            <li className="rounded-full bg-slate-100 px-3 py-1">{restaurant.catering_cuisine}</li>
          ) : null}
        </ul>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          Prefer everyone picking their own meal?{" "}
          <Link href="/order" className="font-semibold text-[var(--geaux-red)] hover:underline">
            Start a group order
          </Link>{" "}
          instead of traditional catering.
        </div>

        <div className="mt-6">
          <EventDetailsBar restaurant={restaurant} />
        </div>

        <nav className="sticky top-[57px] z-20 -mx-4 mt-6 overflow-x-auto border-y border-slate-200 bg-[var(--geaux-cream)]/95 px-4 py-2 backdrop-blur">
          <div className="flex gap-2">
            {byCategory.map(({ category }) => (
              <a
                key={category.id}
                href={`#cat-${category.id}`}
                className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-[var(--geaux-red)] hover:text-[var(--geaux-red)]"
              >
                {category.name}
              </a>
            ))}
          </div>
        </nav>

        <div className="mt-6 grid gap-8 xl:grid-cols-[1fr_320px]">
          <div className="space-y-10">
            {byCategory.map(({ category, items: catItems }) => (
              <section key={category.id} id={`cat-${category.id}`} className="scroll-mt-36">
                <h2 className="text-xl font-bold text-slate-900">{category.name}</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {catItems.map((item) => (
                    <ProductCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            ))}
            {!byCategory.length ? (
              <p className="text-slate-600">No catering items are published yet.</p>
            ) : null}
          </div>

          <aside className="hidden xl:block">
            <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 font-bold text-slate-900">Your cart</h2>
              <CateringCartSummary checkoutHref={checkoutHref} />
            </div>
          </aside>
        </div>
      </div>

      <CateringMobileCartBar />
      <CateringCartDrawer checkoutHref={checkoutHref} />
    </div>
  );
}

export function CateringRestaurantClient(props: {
  restaurant: Restaurant;
  categories: MenuCategory[];
  items: MenuItem[];
  signedInHref?: string | null;
  initialEvent?: Partial<{
    zip: string;
    date: string;
    time: string;
    guests: string;
    fulfillment: string;
  }>;
}) {
  return (
    <CateringCartProvider>
      <CateringRestaurantBootstrap {...props} />
    </CateringCartProvider>
  );
}

function CateringRestaurantBootstrap(
  props: {
    restaurant: Restaurant;
    categories: MenuCategory[];
    items: MenuItem[];
    signedInHref?: string | null;
    initialEvent?: Partial<{
      zip: string;
      date: string;
      time: string;
      guests: string;
      fulfillment: string;
    }>;
  }
) {
  const { setEvent } = useCateringCart();
  useEffect(() => {
    const init = props.initialEvent;
    if (!init) return;
    setEvent({
      ...(init.zip ? { zip: init.zip } : {}),
      ...(init.date ? { eventDate: init.date } : {}),
      ...(init.time ? { eventTime: init.time } : {}),
      ...(init.guests ? { guestCount: Number(init.guests) || 10 } : {}),
      ...(init.fulfillment === "pickup" || init.fulfillment === "delivery"
        ? { fulfillment: init.fulfillment }
        : {}),
    });
  }, [props.initialEvent, setEvent]);

  return <CateringRestaurantInner {...props} />;
}
