"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { checkoutGuest, createOrder, createPaymentIntent } from "@/lib/actions/orders";
import { calculateOrderTotals, countBillableEntrees } from "@/lib/fees/calculate";
import { OrderCheckoutSummary } from "@/components/order/OrderCheckoutSummary";
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
    platform_fee_type: "per_entree",
    flat_fee_cents: 250,
    percentage_bps: 0,
    sales_tax_bps: 0,
  },
}: Props) {
  const serviceFeePerEntree =
    feeSettings.platform_fee_type === "per_entree" ? feeSettings.flat_fee_cents : null;
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
  const [gratuityCents, setGratuityCents] = useState(0);

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
  const entreeCount = countBillableEntrees(
    cartLines.map((l) => {
      const item = menuItems.find((m) => m.id === l.menuItemId);
      return {
        quantity: l.quantity,
        countsAsEntree: item?.counts_as_entree ?? true,
      };
    })
  );
  const feePreview =
    subtotal > 0
      ? calculateOrderTotals(subtotal, feeSettings, entreeCount, gratuityCents)
      : null;

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
          ? await createOrder({
              scheduleId: schedule.id,
              items,
              gratuityCents,
            })
          : await checkoutGuest({
              scheduleId: schedule.id,
              officeId: office.id,
              items,
              fullName: fullName.trim(),
              email: email.trim(),
              gratuityCents,
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
    <div className="space-y-6 pb-24 sm:pb-6">
      <Card className="overflow-hidden border-red-200 p-0">
        {restaurant?.banner_url && restaurant.branding_status !== "rejected" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={restaurant.banner_url}
            alt=""
            className="h-32 w-full object-cover sm:h-40"
          />
        ) : null}
        <div className="p-4">
          <div className="flex items-start gap-3">
            {restaurant?.logo_url && restaurant.branding_status !== "rejected" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={restaurant.logo_url}
                alt=""
                className="h-14 w-14 shrink-0 rounded-lg border object-cover"
              />
            ) : null}
            <div>
              <p className="text-sm font-medium text-red-600">{office.company_name || office.name}</p>
              <h2 className="text-2xl font-bold text-slate-900">{restaurant?.name ?? "Lunch"}</h2>
            </div>
          </div>
        <p className="text-sm text-slate-600">
          {new Date(selectedDate + "T12:00:00").toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
        </div>
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

      {step === "pay" && paymentData && orderId && feePreview ? (
        <Card title="Payment">
          <OrderCheckoutSummary
            breakdown={feePreview}
            feeSettings={feeSettings}
            emphasized
          />
          <div className="mt-6">
            <EmbeddedCheckout
              {...paymentData}
              orderId={orderId}
              guestCheckout={guestMode || !isLoggedIn}
              totalCents={feePreview.totalCents}
            />
          </div>
        </Card>
      ) : step === "details" ? (
        <Card title="Your details">
          {feePreview ? (
            <div className="mb-6">
              <OrderCheckoutSummary
                breakdown={feePreview}
                feeSettings={feeSettings}
                emphasized
              />
            </div>
          ) : null}
          <p className="mb-4 text-sm text-slate-600">
            No account needed — just your name and email for the order confirmation.
          </p>
          <div className="space-y-3">
            <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <GratuityPicker valueCents={gratuityCents} onChange={setGratuityCents} />
            <div className="flex flex-wrap gap-2">
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
                                {serviceFeePerEntree != null &&
                                (item.counts_as_entree ?? true) ? (
                                  <p className="text-xs text-slate-500">
                                    + {formatCents(serviceFeePerEntree)} service fee per entrée
                                  </p>
                                ) : null}
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
                <GratuityPicker valueCents={gratuityCents} onChange={setGratuityCents} compact />
                {feePreview ? (
                  <OrderCheckoutSummary breakdown={feePreview} feeSettings={feeSettings} />
                ) : null}
                <p className="text-xs text-slate-500">
                  Total due is what Stripe charges — food, service fees, and optional gratuity.
                </p>
                <Button className="hidden w-full sm:flex" size="lg" loading={isPending} onClick={proceedToCheckout}>
                  Checkout
                </Button>
              </div>
            )}
          </Card>
        </div>
      ) : null}

      {orderingOpen && step === "menu" && cartLines.length > 0 ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white p-3 shadow-lg sm:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm">
              <p className="font-semibold text-slate-900">
                {feePreview ? formatCents(feePreview.totalCents) : formatCents(subtotal)}
              </p>
              <p className="text-xs text-slate-500">{cartLines.length} line(s) in cart</p>
            </div>
            <Button size="lg" loading={isPending} onClick={proceedToCheckout}>
              Checkout
            </Button>
          </div>
        </div>
      ) : null}

      {!orderingOpen ? (
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
      ) : null}

      <style jsx global>{`
        .qty-btn {
          height: 2.75rem;
          width: 2.75rem;
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
