"use client";

import { useMemo, useState, useTransition } from "react";
import { createOrder, createCheckoutSession } from "@/lib/actions/orders";
import { formatCents } from "@/lib/money/format";
import { Badge, Card, EmptyState, ErrorMessage, Button, SuccessMessage } from "@/components/ui";
import type { DailyLunchSchedule, MenuCategory, MenuItem, Restaurant } from "@/types/database";

interface Props {
  schedule: DailyLunchSchedule & {
    restaurants: Restaurant | null;
  };
  categories: MenuCategory[];
  menuItems: MenuItem[];
}

interface CartEntry {
  menuItemId: string;
  quantity: number;
  specialInstructions: string;
}

export function TodayOrderClient({ schedule, categories, menuItems }: Props) {
  const [cart, setCart] = useState<Record<string, CartEntry>>({});
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const cutoffPassed = new Date(schedule.order_cutoff_at) <= new Date();
  const orderingOpen = schedule.status === "open" && !cutoffPassed;

  const itemsByCategory = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    for (const item of menuItems) {
      const catId = item.category_id ?? "uncategorized";
      const list = map.get(catId) ?? [];
      list.push(item);
      map.set(catId, list);
    }
    return map;
  }, [menuItems]);

  const cartLines = useMemo(() => {
    return Object.values(cart)
      .filter((c) => c.quantity > 0)
      .map((entry) => {
        const item = menuItems.find((m) => m.id === entry.menuItemId);
        if (!item) return null;
        return {
          ...entry,
          name: item.name,
          priceCents: item.price_cents,
          lineTotal: item.price_cents * entry.quantity,
        };
      })
      .filter(Boolean) as Array<
      CartEntry & { name: string; priceCents: number; lineTotal: number }
    >;
  }, [cart, menuItems]);

  const subtotal = cartLines.reduce((sum, line) => sum + line.lineTotal, 0);

  function updateQuantity(menuItemId: string, quantity: number) {
    setCart((prev) => ({
      ...prev,
      [menuItemId]: {
        menuItemId,
        quantity: Math.max(0, quantity),
        specialInstructions: prev[menuItemId]?.specialInstructions ?? "",
      },
    }));
  }

  function updateInstructions(menuItemId: string, value: string) {
    setCart((prev) => ({
      ...prev,
      [menuItemId]: {
        menuItemId,
        quantity: prev[menuItemId]?.quantity ?? 0,
        specialInstructions: value,
      },
    }));
  }

  function handleCheckout() {
    setError(null);
    const items = cartLines.map((line) => ({
      menuItemId: line.menuItemId,
      quantity: line.quantity,
      specialInstructions: line.specialInstructions || undefined,
    }));

    startTransition(async () => {
      const orderResult = await createOrder({ scheduleId: schedule.id, items });
      if (!orderResult.success) {
        setError(orderResult.error);
        return;
      }

      const checkoutResult = await createCheckoutSession(orderResult.data.orderId);
      if (!checkoutResult.success) {
        setError(checkoutResult.error);
        return;
      }

      window.location.href = checkoutResult.data.url;
    });
  }

  const uncategorizedItems = itemsByCategory.get("uncategorized") ?? [];

  const categoriesWithItems = useMemo(
    () =>
      categories.filter(
        (category) => (itemsByCategory.get(category.id) ?? []).length > 0
      ),
    [categories, itemsByCategory]
  );

  function renderMenuItem(item: MenuItem) {
    const entry = cart[item.id];
    const qty = entry?.quantity ?? 0;
    return (
      <div
        key={item.id}
        className="flex flex-col gap-3 border-b border-slate-100 pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between"
      >
        <div>
          <h3 className="font-medium text-slate-900">{item.name}</h3>
          {item.description ? (
            <p className="text-sm text-slate-600">{item.description}</p>
          ) : null}
          <p className="mt-1 font-medium text-slate-900">
            {formatCents(item.price_cents)}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => updateQuantity(item.id, qty - 1)}
              className="h-8 w-8 rounded-lg border border-slate-300 transition-all hover:border-blue-400 hover:bg-blue-50 active:scale-95"
            >
              −
            </button>
            <span className="w-8 text-center font-medium">{qty}</span>
            <button
              type="button"
              onClick={() => updateQuantity(item.id, qty + 1)}
              className="h-8 w-8 rounded-lg border border-slate-300 transition-all hover:border-blue-400 hover:bg-blue-50 active:scale-95"
            >
              +
            </button>
          </div>
          {qty > 0 ? (
            <input
              type="text"
              placeholder="Special instructions"
              value={entry?.specialInstructions ?? ""}
              onChange={(e) => updateInstructions(item.id, e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm sm:w-56"
            />
          ) : null}
        </div>
      </div>
    );
  }

  const restaurant = schedule.restaurants;

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-500">Today&apos;s restaurant</p>
            <h2 className="text-2xl font-semibold text-slate-900">
              {restaurant?.name ?? "Restaurant"}
            </h2>
            {restaurant?.description ? (
              <p className="mt-1 text-slate-600">{restaurant.description}</p>
            ) : null}
          </div>
          <div className="space-y-1 text-sm">
            <p>
              Cutoff:{" "}
              <strong>
                {new Date(schedule.order_cutoff_at).toLocaleString()}
              </strong>
            </p>
            <p>
              Delivery:{" "}
              <strong>{new Date(schedule.delivery_at).toLocaleString()}</strong>
            </p>
            <Badge tone={orderingOpen ? "success" : "warning"}>
              {orderingOpen ? "Ordering open" : "Ordering closed"}
            </Badge>
          </div>
        </div>
      </Card>

      {error ? <ErrorMessage message={error} /> : null}

      {!orderingOpen ? (
        <EmptyState message="Ordering is closed for today's lunch." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {menuItems.length === 0 ? (
              <EmptyState message="No menu items available for today's lunch. Ask your admin to add items to this restaurant's menu." />
            ) : (
              <>
                {categoriesWithItems.map((category) => (
                  <Card key={category.id} title={category.name}>
                    <div className="space-y-4">
                      {(itemsByCategory.get(category.id) ?? []).map(renderMenuItem)}
                    </div>
                  </Card>
                ))}
                {uncategorizedItems.length > 0 ? (
                  <Card
                    title={
                      categoriesWithItems.length > 0 ? "Other items" : "Menu"
                    }
                  >
                    <div className="space-y-4">
                      {uncategorizedItems.map(renderMenuItem)}
                    </div>
                  </Card>
                ) : null}
              </>
            )}
          </div>

          <Card title="Your cart">
            {cartLines.length === 0 ? (
              <p className="text-sm text-slate-500">Add items to your cart.</p>
            ) : (
              <div className="space-y-4">
                {cartLines.map((line) => (
                  <div
                    key={line.menuItemId}
                    className="flex justify-between text-sm"
                  >
                    <span>
                      {line.quantity}× {line.name}
                    </span>
                    <span>{formatCents(line.lineTotal)}</span>
                  </div>
                ))}
                <div className="border-t border-slate-200 pt-3">
                  <div className="flex justify-between font-semibold">
                    <span>Subtotal</span>
                    <span>{formatCents(subtotal)}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Tax and platform fee added at checkout.
                  </p>
                </div>
                <Button
                  type="button"
                  className="w-full"
                  loading={isPending}
                  disabled={cartLines.length === 0}
                  onClick={handleCheckout}
                >
                  Checkout with Stripe
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
