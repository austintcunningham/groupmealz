"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { checkoutGuest, createOrder, createPaymentIntent } from "@/lib/actions/orders";
import { calculateOrderTotals } from "@/lib/fees/calculate";
import { formatCents } from "@/lib/money/format";
import type { PlatformSettings } from "@/types/database";
import { isOrderingWindowOpen, formatOrderingWindow } from "@/lib/scheduling/window";
import { EmbeddedCheckout } from "@/components/checkout/EmbeddedCheckout";
import { OrderingRulesCard } from "@/components/order/OrderingRulesCard";
import { Badge, Button, Card, ErrorMessage, Input, SuccessMessage } from "@/components/ui";
import type {
  DailyLunchSchedule,
  MenuCategory,
  MenuItem,
  Restaurant,
  Office,
} from "@/types/database";

type ScheduleWithRelations = DailyLunchSchedule & {
  restaurants: Restaurant | null;
  offices: Office | null;
};

interface WeekDay {
  lunchDate: string;
  label: string;
  schedule: ScheduleWithRelations | null;
  orderable: boolean;
}

interface Props {
  office: Office;
  schedule: ScheduleWithRelations;
  weekDays: WeekDay[];
  categories: MenuCategory[];
  menuItems: MenuItem[];
  guestMode?: boolean;
  isLoggedIn?: boolean;
  userEmail?: string;
  userName?: string;
  advanceOrderHours?: number;
  feeSettings?: Pick<
    PlatformSettings,
    "platform_fee_type" | "flat_fee_cents" | "percentage_bps" | "sales_tax_bps"
  >;
}

interface CartEntry {
  menuItemId: string;
  quantity: number;
  specialInstructions: string;
}

export function OrderFlowClient({
  office,
  schedule,
  weekDays,
  categories,
  menuItems,
  guestMode = true,
  isLoggedIn = false,
  userEmail,
  userName,
  advanceOrderHours = 48,
  feeSettings = {
    platform_fee_type: "flat",
    flat_fee_cents: 250,
    percentage_bps: 0,
    sales_tax_bps: 0,
  },
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cart, setCart] = useState<Record<string, CartEntry>>({});
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<"menu" | "details" | "pay">("menu");
  const [fullName, setFullName] = useState(userName ?? "");
  const [email, setEmail] = useState(userEmail ?? "");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<{
    clientSecret: string;
    publishableKey: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cartNotice, setCartNotice] = useState<string | null>(null);

  const orderingOpen = isOrderingWindowOpen(schedule);
  const selectedDate = schedule.lunch_date;

  useEffect(() => {
    if (!cartNotice) return;
    const t = window.setTimeout(() => setCartNotice(null), 2500);
    return () => window.clearTimeout(t);
  }, [cartNotice]);

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
          lineTotal: item.price_cents * entry.quantity,
        };
      })
      .filter(Boolean) as Array<CartEntry & { name: string; lineTotal: number }>;
  }, [cart, menuItems]);

  const subtotal = cartLines.reduce((s, l) => s + l.lineTotal, 0);
  const feePreview =
    subtotal > 0 ? calculateOrderTotals(subtotal, feeSettings) : null;

  function pickDay(lunchDate: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", lunchDate);
    if (!office.slug) return;
    router.push(`/order/${office.slug}?${params.toString()}`);
    setCart({});
    setStep("menu");
  }

  function updateQty(id: string, qty: number) {
    if (qty > (cart[id]?.quantity ?? 0)) {
      const item = menuItems.find((m) => m.id === id);
      if (item) setCartNotice(`Added ${item.name}`);
    }
    setCart((p) => ({
      ...p,
      [id]: {
        menuItemId: id,
        quantity: Math.max(0, qty),
        specialInstructions: p[id]?.specialInstructions ?? "",
      },
    }));
  }

  function proceedToCheckout() {
    setError(null);
    if (!cartLines.length) {
      setError("Add at least one item");
      return;
    }
    if (isLoggedIn && !guestMode) {
      startCheckout();
    } else {
      setStep("details");
    }
  }

  function startCheckout() {
    if (!fullName.trim() || !email.trim()) {
      setError("Name and email are required");
      return;
    }
    startTransition(async () => {
      const items = cartLines.map((l) => ({
        menuItemId: l.menuItemId,
        quantity: l.quantity,
        specialInstructions: l.specialInstructions || undefined,
      }));

      const result =
        isLoggedIn && !guestMode
          ? await createOrder({ scheduleId: schedule.id, items })
          : await checkoutGuest({
              scheduleId: schedule.id,
              officeId: office.id,
              items,
              fullName: fullName.trim(),
              email: email.trim(),
            });

      if (!result.success) {
        setError(result.error);
        return;
      }

      const pay = await createPaymentIntent(result.data.orderId, {
        saveCard: isLoggedIn && !guestMode,
        guestEmail: guestMode || !isLoggedIn ? email.trim() : undefined,
      });
      if (!pay.success) {
        setError(pay.error);
        return;
      }

      setOrderId(result.data.orderId);
      setPaymentData({
        clientSecret: pay.data.clientSecret,
        publishableKey: pay.data.publishableKey,
      });
      setStep("pay");
    });
  }

  const restaurant = schedule.restaurants;

  return (
    <div className="space-y-6">
      <Card className="border-red-200">
        <p className="text-sm font-medium text-red-600">{office.company_name || office.name}</p>
        <h2 className="text-2xl font-bold text-slate-900">{restaurant?.name ?? "Lunch"}</h2>
        <p className="text-sm text-slate-600">
          {new Date(selectedDate + "T12:00:00").toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </Card>

      <OrderingRulesCard schedule={schedule} advanceOrderHours={advanceOrderHours} />

      <Card title="This week">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {weekDays.map((day) => {
            const active = day.lunchDate === selectedDate;
            const disabled = !day.schedule;
            return (
              <button
                key={day.lunchDate}
                type="button"
                disabled={disabled}
                onClick={() => day.schedule && pickDay(day.lunchDate)}
                className={`rounded-xl border p-3 text-left text-sm transition-all active:scale-[0.98] ${
                  active
                    ? "border-[var(--geaux-red)] bg-red-50 ring-2 ring-[var(--geaux-yellow)]"
                    : disabled
                      ? "cursor-not-allowed border-slate-100 bg-slate-50 opacity-60"
                      : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-[var(--geaux-yellow)] hover:shadow-md"
                }`}
              >
                <p className="font-semibold text-slate-800">{day.label}</p>
                {day.schedule ? (
                  <>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-600">
                      {day.schedule.restaurants?.name ?? "TBD"}
                    </p>
                    <p className="mt-1 text-xs font-medium">
                      {day.orderable ? (
                        <span className="text-green-700">Order now</span>
                      ) : (
                        <span className="capitalize text-slate-500">{day.schedule.status}</span>
                      )}
                    </p>
                  </>
                ) : (
                  <p className="mt-1 text-xs text-slate-400">No lunch</p>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="border-slate-200">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span>
            <span className="text-slate-500">Order window:</span> {formatOrderingWindow(schedule)}
          </span>
          <span>
            <span className="text-slate-500">Delivery:</span>{" "}
            {new Date(schedule.delivery_at).toLocaleString()}
          </span>
          <Badge tone={orderingOpen ? "success" : "warning"}>
            {orderingOpen ? "Open" : "Closed"}
          </Badge>
        </div>
      </Card>

      {error ? <ErrorMessage message={error} /> : null}

      {step === "pay" && paymentData && orderId ? (
        <Card title="Payment">
          <EmbeddedCheckout
            {...paymentData}
            orderId={orderId}
            guestCheckout={guestMode || !isLoggedIn}
          />
        </Card>
      ) : step === "details" ? (
        <Card title="Your details">
          <p className="mb-4 text-sm text-slate-600">
            No account needed — just your name and email for the order confirmation.
          </p>
          <div className="space-y-3">
            <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setStep("menu")}>
                Back
              </Button>
              <Button loading={isPending} onClick={startCheckout}>
                Continue to payment
              </Button>
            </div>
          </div>
        </Card>
      ) : orderingOpen ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {menuItems.length === 0 ? (
              <Card>
                <p className="text-slate-500">No menu items available for this day.</p>
              </Card>
            ) : (
              <>
                {categories.map((cat) => {
                  const items = itemsByCategory.get(cat.id) ?? [];
                  if (!items.length) return null;
                  return (
                    <Card key={cat.id} title={cat.name}>
                      <div className="space-y-4">
                        {items.map((item) => {
                          const qty = cart[item.id]?.quantity ?? 0;
                          return (
                            <div
                              key={item.id}
                              className="flex justify-between gap-4 border-b border-slate-100 pb-4 last:border-0"
                            >
                              <div>
                                <h3 className="font-semibold">{item.name}</h3>
                                <p className="font-medium text-red-600">{formatCents(item.price_cents)}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button type="button" onClick={() => updateQty(item.id, qty - 1)} className="qty-btn">
                                  −
                                </button>
                                <span className="w-6 text-center font-bold">{qty}</span>
                                <button type="button" onClick={() => updateQty(item.id, qty + 1)} className="qty-btn">
                                  +
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  );
                })}
                {(itemsByCategory.get("uncategorized") ?? []).length > 0 ? (
                  <Card title="Menu">
                    {(itemsByCategory.get("uncategorized") ?? []).map((item) => {
                      const qty = cart[item.id]?.quantity ?? 0;
                      return (
                        <div key={item.id} className="flex justify-between py-2">
                          <span>
                            {item.name} — {formatCents(item.price_cents)}
                          </span>
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => updateQty(item.id, qty - 1)} className="qty-btn">
                              −
                            </button>
                            <span>{qty}</span>
                            <button type="button" onClick={() => updateQty(item.id, qty + 1)} className="qty-btn">
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </Card>
                ) : null}
              </>
            )}
          </div>
          <Card title="Your cart" className="sticky top-4 h-fit">
            {cartNotice ? (
              <div className="mb-3">
                <SuccessMessage message={cartNotice} />
              </div>
            ) : null}
            {cartLines.length === 0 ? (
              <p className="text-sm text-slate-500">Pick something tasty!</p>
            ) : (
              <div className="space-y-4">
                {cartLines.map((l) => (
                  <div key={l.menuItemId} className="flex justify-between text-sm">
                    <span>
                      {l.quantity}× {l.name}
                    </span>
                    <span>{formatCents(l.lineTotal)}</span>
                  </div>
                ))}
                <div className="space-y-1 border-t pt-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Food subtotal</span>
                    <span>{formatCents(subtotal)}</span>
                  </div>
                  {feePreview && feePreview.platformFeeCents > 0 ? (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Service fee (per order)</span>
                      <span>{formatCents(feePreview.platformFeeCents)}</span>
                    </div>
                  ) : null}
                  {feePreview && feePreview.taxCents > 0 ? (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Tax</span>
                      <span>{formatCents(feePreview.taxCents)}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold">
                    <span>Estimated total</span>
                    <span className="text-[var(--geaux-red)]">
                      {formatCents(feePreview?.totalCents ?? subtotal)}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  One service fee per checkout, not per item. Final total confirmed at payment.
                </p>
                <Button className="w-full" size="lg" loading={isPending} onClick={proceedToCheckout}>
                  Checkout
                </Button>
              </div>
            )}
          </Card>
        </div>
      ) : (
        <Card>
          <p className="text-slate-600">
            Ordering isn&apos;t open for this day yet. Pick another day above or check back during the order window.
          </p>
          {isLoggedIn ? (
            <Link href="/login" className="mt-3 inline-block text-sm text-red-600 hover:underline">
              Staff login →
            </Link>
          ) : null}
        </Card>
      )}

      <style jsx global>{`
        .qty-btn {
          height: 2rem;
          width: 2rem;
          border-radius: 0.5rem;
          border: 2px solid #fdb913;
          background: #fffbf5;
          font-weight: 700;
          transition: all 0.15s;
        }
        .qty-btn:hover {
          background: #fdb913;
          transform: scale(1.05);
        }
        .qty-btn:active {
          transform: scale(0.95);
        }
      `}</style>
    </div>
  );
}
