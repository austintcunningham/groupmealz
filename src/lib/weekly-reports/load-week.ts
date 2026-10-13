import { createAdminClient } from "@/lib/supabase/admin";
import {
  buildCheckStubFromOrders,
  filterOrdersInWeekByDate,
  type SettlementPeriod,
} from "@/lib/accounting/restaurant-settlement";
import type { Order } from "@/types/database";

export type WeekOrder = Order & {
  daily_lunch_schedules: { lunch_date: string } | { lunch_date: string }[] | null;
  order_items: { quantity: number }[];
  restaurants: { name: string } | { name: string }[] | null;
  offices: { name: string } | { name: string }[] | null;
};

export function lunchDateForOrder(o: WeekOrder): string {
  const sched = o.daily_lunch_schedules;
  const row = Array.isArray(sched) ? sched[0] : sched;
  return row?.lunch_date ?? o.created_at.slice(0, 10);
}

export function mealCountForOrder(o: WeekOrder): number {
  const items = o.order_items ?? [];
  if (!items.length) return 1;
  return items.reduce((s, i) => s + (i.quantity ?? 1), 0);
}

function relationName(
  rel: { name: string } | { name: string }[] | null | undefined
): string {
  if (!rel) return "Unknown";
  return Array.isArray(rel) ? rel[0]?.name ?? "Unknown" : rel.name;
}

export async function loadPaidOrdersForWeek(
  period: SettlementPeriod
): Promise<WeekOrder[] | { error: string }> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "*, daily_lunch_schedules(lunch_date), order_items(quantity), restaurants(name), offices(name)"
    )
    .eq("status", "paid");

  if (error) return { error: error.message };

  const rows = (data ?? []) as WeekOrder[];
  return filterOrdersInWeekByDate(
    rows as Parameters<typeof filterOrdersInWeekByDate>[0],
    period,
    (o) => lunchDateForOrder(o as WeekOrder)
  ) as WeekOrder[];
}

export async function loadReviewsForWeek(period: SettlementPeriod) {
  const supabase = createAdminClient();
  const start = `${period.weekStart}T00:00:00.000Z`;
  const end = `${period.weekEnd}T23:59:59.999Z`;

  const { data, error } = await supabase
    .from("restaurant_reviews")
    .select("id, rating, comment, created_at, restaurant_id, office_id, restaurants(name), offices(name)")
    .gte("created_at", start)
    .lte("created_at", end);

  if (error) return { error: error.message, reviews: [] as ReviewRow[] };

  return { reviews: (data ?? []) as ReviewRow[] };
}

export type ReviewRow = {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  restaurant_id: string;
  office_id: string;
  restaurants: { name: string } | { name: string }[] | null;
  offices: { name: string } | { name: string }[] | null;
};

export async function buildRestaurantWeeklyStub(
  restaurantId: string,
  period: SettlementPeriod
) {
  const supabase = createAdminClient();
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("name, street_address, city, state, zip, email")
    .eq("id", restaurantId)
    .single();

  if (!restaurant) return { error: "Restaurant not found" as const };

  const { data: settings } = await supabase.from("platform_settings").select("*").limit(1).single();
  const commissionBps = settings?.restaurant_commission_bps ?? 1200;

  const ordersResult = await loadPaidOrdersForWeek(period);
  if (!Array.isArray(ordersResult)) return { error: ordersResult.error };

  const weekOrders = ordersResult.filter((o) => o.restaurant_id === restaurantId);
  const address = [restaurant.street_address, restaurant.city, restaurant.state, restaurant.zip]
    .filter(Boolean)
    .join(", ");

  return {
    stub: buildCheckStubFromOrders(weekOrders, {
      restaurantName: restaurant.name,
      restaurantAddress: address,
      period,
      commissionBps,
    }),
    email: restaurant.email?.trim() || null,
  };
}

export type OfficeWeekSummary = {
  officeId: string;
  officeName: string;
  totalMeals: number;
  byRestaurant: { restaurantName: string; meals: number }[];
};

export function summarizeOfficeWeek(orders: WeekOrder[]): OfficeWeekSummary[] {
  const byOffice = new Map<
    string,
    { officeName: string; restaurants: Map<string, number>; totalMeals: number }
  >();

  for (const o of orders) {
    const officeId = o.office_id;
    const officeName = relationName(o.offices);
    const restaurantName = relationName(o.restaurants);
    const meals = mealCountForOrder(o);

    const row = byOffice.get(officeId) ?? {
      officeName,
      restaurants: new Map(),
      totalMeals: 0,
    };
    row.totalMeals += meals;
    row.restaurants.set(restaurantName, (row.restaurants.get(restaurantName) ?? 0) + meals);
    byOffice.set(officeId, row);
  }

  return Array.from(byOffice.entries())
    .map(([officeId, row]) => ({
      officeId,
      officeName: row.officeName,
      totalMeals: row.totalMeals,
      byRestaurant: Array.from(row.restaurants.entries())
        .map(([restaurantName, meals]) => ({ restaurantName, meals }))
        .sort((a, b) => b.meals - a.meals || a.restaurantName.localeCompare(b.restaurantName)),
    }))
    .sort((a, b) => a.officeName.localeCompare(b.officeName));
}

export type OpsWeekSummary = {
  period: SettlementPeriod;
  reviewCount: number;
  averageRating: number | null;
  byRestaurantRating: { restaurantName: string; avg: number; count: number }[];
  officeSummaries: OfficeWeekSummary[];
  mealsByRestaurant: { restaurantName: string; meals: number }[];
  revenue: {
    orderCount: number;
    grossSalesCents: number;
    platformFeeCents: number;
    taxCents: number;
    restaurantPayoutCents: number;
    platformNetCents: number;
  };
};

export function buildOpsWeekSummary(
  period: SettlementPeriod,
  orders: WeekOrder[],
  reviews: ReviewRow[]
): OpsWeekSummary {
  const officeSummaries = summarizeOfficeWeek(orders);

  const restaurantMeals = new Map<string, number>();
  let grossSalesCents = 0;
  let platformFeeCents = 0;
  let taxCents = 0;
  let restaurantPayoutCents = 0;

  for (const o of orders) {
    const name = relationName(o.restaurants);
    restaurantMeals.set(name, (restaurantMeals.get(name) ?? 0) + mealCountForOrder(o));
    grossSalesCents += o.subtotal_cents + o.tax_cents + (o.gratuity_cents ?? 0);
    platformFeeCents += o.platform_fee_cents;
    taxCents += o.tax_cents;
    restaurantPayoutCents += o.payout_due_cents;
  }

  const ratingByRestaurant = new Map<string, { sum: number; count: number }>();
  for (const r of reviews) {
    const name = relationName(r.restaurants);
    const row = ratingByRestaurant.get(name) ?? { sum: 0, count: 0 };
    row.sum += r.rating;
    row.count += 1;
    ratingByRestaurant.set(name, row);
  }

  const byRestaurantRating = Array.from(ratingByRestaurant.entries())
    .map(([restaurantName, { sum, count }]) => ({
      restaurantName,
      avg: sum / count,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const reviewCount = reviews.length;
  const averageRating =
    reviewCount > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviewCount : null;

  return {
    period,
    reviewCount,
    averageRating,
    byRestaurantRating,
    officeSummaries,
    mealsByRestaurant: Array.from(restaurantMeals.entries())
      .map(([restaurantName, meals]) => ({ restaurantName, meals }))
      .sort((a, b) => b.meals - a.meals || a.restaurantName.localeCompare(b.restaurantName)),
    revenue: {
      orderCount: orders.length,
      grossSalesCents,
      platformFeeCents,
      taxCents,
      restaurantPayoutCents,
      platformNetCents: platformFeeCents,
    },
  };
}
