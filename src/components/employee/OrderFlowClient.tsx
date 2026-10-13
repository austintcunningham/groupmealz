"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { checkoutGuest, createOrder, createPaymentIntent } from "@/lib/actions/orders";
import { calculateOrderTotals, countBillableEntrees } from "@/lib/fees/calculate";
import { OrderCheckoutSummary } from "@/components/order/OrderCheckoutSummary";
import { OrderCartDrawer } from "@/components/order/OrderCartDrawer";
import { OrderCartPanel } from "@/components/order/OrderCartPanel";
import { OrderMobileCartBar } from "@/components/order/OrderMobileCartBar";
import { OrderMobileMenuHeader } from "@/components/order/OrderMobileMenuHeader";
import { CustomerOrderMenu, type CustomerCartLine } from "@/components/order/CustomerOrderMenu";
import {
  buildCartLineKey,
  buildItemNameSnapshot,
  formatRemovedIngredients,
  orderUnitPriceCents,
} from "@/lib/menus/item-options";
import { formatCents } from "@/lib/money/format";
import type { PlatformSettings } from "@/types/database";
import { isOrderingWindowOpen, formatOrderingWindow } from "@/lib/scheduling/window";
import { EmbeddedCheckout } from "@/components/checkout/EmbeddedCheckout";
import { CustomerOrderRestaurantHero } from "@/components/order/CustomerOrderRestaurantHero";
import { OrderingRulesCard } from "@/components/order/OrderingRulesCard";
import { liveCustomerBranding } from "@/lib/restaurant/branding-display";
import { Badge, Button, Card, ErrorMessage, Input, Textarea } from "@/components/ui";
import type {
  DailyLunchSchedule,
  MenuCategory,
  MenuItem,
  MenuItemIngredient,
  MenuItemSize,
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
  sizesByMenuItemId?: Record<string, MenuItemSize[]>;
  ingredientsByMenuItemId?: Record<string, MenuItemIngredient[]>;
  guestMode?: boolean;
  isLoggedIn?: boolean;
  userEmail?: string;
  userName?: string;
  advanceOrderHours?: number;
  feeSettings?: Pick<
    PlatformSettings,
    "platform_fee_type" | "flat_fee_cents" | "percentage_bps" | "sales_tax_bps"
  >;
  /** Full UI without placing orders (admin / dev simulation). */
  previewMode?: boolean;
}

export function OrderFlowClient({
  office,
  schedule,
  weekDays,
  categories,
  menuItems,
  sizesByMenuItemId = {},
  ingredientsByMenuItemId = {},
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
  previewMode = false,
}: Props) {
  const serviceFeePerEntree =
    feeSettings.platform_fee_type === "per_entree" ? feeSettings.flat_fee_cents : null;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cart, setCart] = useState<Record<string, CustomerCartLine>>({});
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
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [gratuityCents, setGratuityCents] = useState(0);
  const [restaurantNote, setRestaurantNote] = useState("");

  const orderingOpen = isOrderingWindowOpen(schedule);
  const selectedDate = schedule.lunch_date;

  useEffect(() => {
    if (!cartNotice) return;
    const t = window.setTimeout(() => setCartNotice(null), 2500);
    return () => window.clearTimeout(t);
  }, [cartNotice]);

  const cartLines = useMemo(() => {
    return Object.values(cart)
      .filter((c) => c.quantity > 0)
      .map((entry) => {
        const item = menuItems.find((m) => m.id === entry.menuItemId);
        if (!item) return null;
        const sizes = sizesByMenuItemId[entry.menuItemId] ?? [];
        const size = sizes.find((s) => s.id === entry.sizeId) ?? null;
        const unit = orderUnitPriceCents(item, schedule.lunch_date, size);
        const ingredients = ingredientsByMenuItemId[entry.menuItemId] ?? [];
        const removedNames = ingredients
          .filter((i) => entry.removedIngredientIds.includes(i.id))
          .map((i) => i.name);
        const mod = formatRemovedIngredients(removedNames);
        return {
          ...entry,
          name: buildItemNameSnapshot(item.name, size?.name ?? null),
          modifierLabel: mod,
          lineTotal: unit * entry.quantity,
        };
      })
      .filter(Boolean) as Array<
      CustomerCartLine & { name: string; modifierLabel: string | null; lineTotal: number }
    >;
  }, [cart, menuItems, schedule.lunch_date, sizesByMenuItemId, ingredientsByMenuItemId]);

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

  function updateSimpleQty(lineKey: string, menuItemId: string, qty: number) {
    if (qty > (cart[lineKey]?.quantity ?? 0)) {
      const item = menuItems.find((m) => m.id === menuItemId);
      if (item) setCartNotice(`Added ${item.name}`);
    }
    setCart((p) => {
      const next = { ...p };
      if (qty <= 0) {
        delete next[lineKey];
        return next;
      }
      next[lineKey] = {
        lineKey,
        menuItemId,
        sizeId: null,
        removedIngredientIds: [],
        quantity: qty,
        specialInstructions: p[lineKey]?.specialInstructions ?? "",
      };
      return next;
    });
  }

  function addConfiguredLine(line: Omit<CustomerCartLine, "lineKey" | "quantity">) {
    const lineKey = buildCartLineKey(line.menuItemId, line.sizeId, line.removedIngredientIds);
    const item = menuItems.find((m) => m.id === line.menuItemId);
    setCart((p) => ({
      ...p,
      [lineKey]: {
        lineKey,
        ...line,
        quantity: (p[lineKey]?.quantity ?? 0) + 1,
        specialInstructions: p[lineKey]?.specialInstructions ?? "",
      },
    }));
    if (item) setCartNotice(`Added ${item.name}`);
  }

  function proceedToCheckout() {
    if (previewMode) return;
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
        sizeId: l.sizeId,
        removedIngredientIds: l.removedIngredientIds,
        specialInstructions: l.specialInstructions || undefined,
      }));
      const customerNote = restaurantNote.trim() || undefined;

      const result =
        isLoggedIn && !guestMode
          ? await createOrder({
              scheduleId: schedule.id,
              items,
              gratuityCents,
              customerNote,
            })
          : await checkoutGuest({
              scheduleId: schedule.id,
              officeId: office.id,
              items,
              fullName: fullName.trim(),
              email: email.trim(),
              gratuityCents,
              customerNote,
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
  const customerBranding = restaurant ? liveCustomerBranding(restaurant) : { logoUrl: null, bannerUrl: null };
  const dateLabel = new Date(selectedDate + "T12:00:00").toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className={`geaux-main-enter w-full min-w-0 space-y-6 overflow-x-hidden ${cartLines.length > 0 && step === "menu" && orderingOpen ? "pb-28 xl:pb-8" : "pb-8"}`}
    >
      <CustomerOrderRestaurantHero
        officeLabel={office.company_name || office.name}
        restaurantName={restaurant?.name ?? "Lunch"}
        dateLabel={dateLabel}
        logoUrl={customerBranding.logoUrl}
        bannerUrl={customerBranding.bannerUrl}
      />

      <OrderingRulesCard schedule={schedule} advanceOrderHours={advanceOrderHours} />

      <details className="xl:hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <summary className="cursor-pointer list-none px-4 py-3 marker:content-none [&::-webkit-details-marker]:hidden">
          <p className="text-sm font-bold text-slate-900">This week</p>
          <p className="text-xs text-slate-500">
            {restaurant?.name ?? "Pick a day"} · tap to change day
          </p>
        </summary>
        <div className="border-t border-slate-100 p-3 pt-2">
          <WeekDayGrid
            weekDays={weekDays}
            selectedDate={selectedDate}
            onPickDay={pickDay}
          />
        </div>
      </details>

      <Card title="This week" className="hidden xl:block">
        <WeekDayGrid weekDays={weekDays} selectedDate={selectedDate} onPickDay={pickDay} />
      </Card>

      <Card className="hidden border-slate-200 xl:flex">
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

      <div className="flex flex-wrap items-center gap-2 text-sm xl:hidden">
        <Badge tone={orderingOpen ? "success" : "warning"}>
          {orderingOpen ? "Ordering open" : "Ordering closed"}
        </Badge>
        <span className="text-xs text-slate-500">
          Delivery {new Date(schedule.delivery_at).toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" })}
        </span>
      </div>

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
            <Textarea
              label="Note for the restaurant"
              hint="Optional — allergies, pickup details, or anything the kitchen should know."
              value={restaurantNote}
              onChange={(e) => setRestaurantNote(e.target.value.slice(0, 500))}
              maxLength={500}
              rows={3}
              placeholder="e.g. Please cut in half, extra napkins for the office…"
            />
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
        <div className="grid w-full min-w-0 gap-8 xl:grid-cols-12">
          <div className="min-w-0 space-y-6 xl:col-span-8">
            <OrderMobileMenuHeader
              itemCount={cartLines.reduce((s, l) => s + l.quantity, 0)}
              totalLabel={
                feePreview ? formatCents(feePreview.totalCents) : formatCents(subtotal)
              }
              onOpenCart={() => setCartDrawerOpen(true)}
            />
            {menuItems.length === 0 ? (
              <Card>
                <p className="text-slate-500">No menu items available for this day.</p>
              </Card>
            ) : (
              <CustomerOrderMenu
                categories={categories}
                menuItems={menuItems}
                lunchDate={schedule.lunch_date}
                interactive
                cart={cart}
                sizesByMenuItemId={sizesByMenuItemId}
                ingredientsByMenuItemId={ingredientsByMenuItemId}
                onSimpleQtyChange={(lineKey, qty) => {
                  const menuItemId = lineKey.split(":")[0] ?? "";
                  updateSimpleQty(lineKey, menuItemId, qty);
                }}
                onAddConfigured={addConfiguredLine}
              />
            )}
            <Card title="Note for the restaurant">
              <Textarea
                hint="Optional — shared with the restaurant when your order is sent (not per item)."
                value={restaurantNote}
                onChange={(e) => setRestaurantNote(e.target.value.slice(0, 500))}
                maxLength={500}
                rows={3}
                placeholder="Allergies, special requests, or anything the kitchen should know…"
                aria-label="Note for the restaurant"
              />
            </Card>
          </div>
          <Card title="Your cart" className="sticky top-4 hidden h-fit xl:col-span-4 xl:block">
            <OrderCartPanel
              cartLines={cartLines}
              cartNotice={cartNotice}
              restaurantNote={restaurantNote}
              gratuityCents={gratuityCents}
              onGratuityChange={setGratuityCents}
              feePreview={feePreview}
              feeSettings={feeSettings}
              previewMode={previewMode}
              isPending={isPending}
              onCheckout={proceedToCheckout}
            />
          </Card>
        </div>
      ) : null}

      {orderingOpen && step === "menu" ? (
        <OrderMobileCartBar
          itemCount={cartLines.reduce((s, l) => s + l.quantity, 0)}
          subtotalCents={subtotal}
          totalCents={feePreview?.totalCents ?? null}
          onOpenCart={() => setCartDrawerOpen(true)}
          onCheckout={proceedToCheckout}
          previewMode={previewMode}
          isPending={isPending}
        />
      ) : null}

      <OrderCartDrawer
        open={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        cartLines={cartLines}
        cartNotice={cartNotice}
        restaurantNote={restaurantNote}
        gratuityCents={gratuityCents}
        onGratuityChange={setGratuityCents}
        feePreview={feePreview}
        feeSettings={feeSettings}
        previewMode={previewMode}
        isPending={isPending}
        onCheckout={proceedToCheckout}
      />

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

    </div>
  );
}

function GratuityPicker({
  valueCents,
  onChange,
}: {
  valueCents: number;
  onChange: (cents: number) => void;
}) {
  const presets = [0, 100, 200, 300];
  return (
    <div className="space-y-2">
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

function WeekDayGrid({
  weekDays,
  selectedDate,
  onPickDay,
}: {
  weekDays: WeekDay[];
  selectedDate: string;
  onPickDay: (lunchDate: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
      {weekDays.map((day) => {
        const active = day.lunchDate === selectedDate;
        const disabled = !day.schedule;
        return (
          <button
            key={day.lunchDate}
            type="button"
            disabled={disabled}
            onClick={() => day.schedule && onPickDay(day.lunchDate)}
            className={`rounded-xl border p-3 text-left text-sm transition-all duration-200 active:scale-[0.98] ${
              active
                ? "border-[var(--geaux-red)] bg-red-50/80 shadow-[var(--geaux-shadow-md)] ring-2 ring-[var(--geaux-yellow)]"
                : disabled
                  ? "cursor-not-allowed border-slate-100 bg-slate-50/80 opacity-60"
                  : "border-[var(--geaux-border)] bg-white shadow-[var(--geaux-shadow-sm)] hover:-translate-y-0.5 hover:border-[var(--geaux-yellow)] hover:shadow-[var(--geaux-shadow-md)]"
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
  );
}
