import type { Order } from "@/types/database";

export type SettlementPeriod = {
  weekStart: string;
  weekEnd: string;
  label: string;
};

export type RestaurantCheckStub = {
  restaurantName: string;
  restaurantAddress: string;
  period: SettlementPeriod;
  orderCount: number;
  subtotalCents: number;
  gratuityCents: number;
  taxCents: number;
  deliveryCents: number;
  grossSalesCents: number;
  commissionBps: number;
  commissionCents: number;
  stripeFeeCents: number;
  checkTotalCents: number;
};

/** Monday–Sunday week containing `date` (local date string YYYY-MM-DD). */
export function weekBoundsForDate(dateStr: string): SettlementPeriod {
  const d = new Date(`${dateStr}T12:00:00`);
  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmt = (x: Date) => x.toISOString().slice(0, 10);
  const weekStart = fmt(monday);
  const weekEnd = fmt(sunday);
  const label = `${monday.toLocaleDateString(undefined, { month: "2-digit", day: "2-digit", year: "numeric" })} – ${sunday.toLocaleDateString(undefined, { month: "2-digit", day: "2-digit", year: "numeric" })}`;

  return { weekStart, weekEnd, label };
}

type OrderRow = Pick<
  Order,
  | "subtotal_cents"
  | "tax_cents"
  | "gratuity_cents"
  | "restaurant_commission_cents"
  | "stripe_processing_fee_cents"
  | "payout_due_cents"
  | "created_at"
  | "status"
>;

export function buildCheckStubFromOrders(
  orders: OrderRow[],
  meta: {
    restaurantName: string;
    restaurantAddress: string;
    period: SettlementPeriod;
    commissionBps: number;
  }
): RestaurantCheckStub {
  const paid = orders.filter((o) => o.status === "paid");
  let subtotalCents = 0;
  let gratuityCents = 0;
  let taxCents = 0;
  let commissionCents = 0;
  let stripeFeeCents = 0;
  let checkTotalCents = 0;

  for (const o of paid) {
    subtotalCents += o.subtotal_cents;
    gratuityCents += o.gratuity_cents ?? 0;
    taxCents += o.tax_cents;
    commissionCents += o.restaurant_commission_cents ?? 0;
    stripeFeeCents += o.stripe_processing_fee_cents ?? 0;
    checkTotalCents += o.payout_due_cents;
  }

  const grossSalesCents = subtotalCents + taxCents + gratuityCents;

  return {
    restaurantName: meta.restaurantName,
    restaurantAddress: meta.restaurantAddress,
    period: meta.period,
    orderCount: paid.length,
    subtotalCents,
    gratuityCents,
    taxCents,
    deliveryCents: 0,
    grossSalesCents,
    commissionBps: meta.commissionBps,
    commissionCents,
    stripeFeeCents,
    checkTotalCents,
  };
}

export function filterOrdersInWeek(orders: OrderRow[], period: SettlementPeriod): OrderRow[] {
  return orders.filter((o) => {
    const day = o.created_at.slice(0, 10);
    return day >= period.weekStart && day <= period.weekEnd;
  });
}

/** Move a YYYY-MM-DD anchor by whole weeks (for report navigation). */
export function shiftWeekAnchor(dateStr: string, weekDelta: number): string {
  const d = new Date(`${dateStr}T12:00:00`);
  d.setDate(d.getDate() + weekDelta * 7);
  return d.toISOString().slice(0, 10);
}

export function filterOrdersInWeekByDate(
  orders: OrderRow[],
  period: SettlementPeriod,
  dateFor: (order: OrderRow) => string
): OrderRow[] {
  return orders.filter((o) => {
    const day = dateFor(o);
    return day >= period.weekStart && day <= period.weekEnd;
  });
}

export type DailyRestaurantSummary = {
  lunchDate: string;
  orderCount: number;
  subtotalCents: number;
  grossSalesCents: number;
  payoutCents: number;
};

export function summarizeOrdersByDay(
  orders: OrderRow[],
  lunchDateField: (o: OrderRow) => string
): DailyRestaurantSummary[] {
  const map = new Map<string, DailyRestaurantSummary>();

  for (const o of orders.filter((x) => x.status === "paid")) {
    const lunchDate = lunchDateField(o);
    const row = map.get(lunchDate) ?? {
      lunchDate,
      orderCount: 0,
      subtotalCents: 0,
      grossSalesCents: 0,
      payoutCents: 0,
    };
    row.orderCount += 1;
    row.subtotalCents += o.subtotal_cents;
    row.grossSalesCents +=
      o.subtotal_cents + o.tax_cents + (o.gratuity_cents ?? 0);
    row.payoutCents += o.payout_due_cents;
    map.set(lunchDate, row);
  }

  return Array.from(map.values()).sort((a, b) => b.lunchDate.localeCompare(a.lunchDate));
}
