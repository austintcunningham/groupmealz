"use server";

import { createClient } from "@/lib/supabase/server";
import { requireProfileRole } from "@/lib/actions/utils";
import {
  buildCheckStubFromOrders,
  filterOrdersInWeek,
  summarizeOrdersByDay,
  weekBoundsForDate,
  type RestaurantCheckStub,
  type DailyRestaurantSummary,
} from "@/lib/accounting/restaurant-settlement";
import type { Order } from "@/types/database";

async function assertRestaurantAccess(
  restaurantId: string,
  role: string,
  userId: string
): Promise<boolean> {
  if (role === "admin") return true;
  const supabase = await createClient();
  const { data } = await supabase
    .from("restaurant_users")
    .select("id")
    .eq("restaurant_id", restaurantId)
    .eq("user_id", userId)
    .maybeSingle();
  return Boolean(data);
}

export async function getRestaurantWeeklyCheckStub(
  restaurantId: string,
  weekDate?: string
): Promise<{ data: RestaurantCheckStub } | { error: string }> {
  const auth = await requireProfileRole(["restaurant_manager", "admin"]);
  if ("error" in auth) return { error: auth.error };

  const allowed = await assertRestaurantAccess(
    restaurantId,
    auth.profile.role,
    auth.profile.id
  );
  if (!allowed) return { error: "Unauthorized" };

  const supabase = await createClient();
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("name, street_address, city, state, zip")
    .eq("id", restaurantId)
    .single();

  if (!restaurant) return { error: "Restaurant not found" };

  const { data: settings } = await supabase.from("platform_settings").select("*").limit(1).single();
  const commissionBps = settings?.restaurant_commission_bps ?? 1000;

  const period = weekBoundsForDate(weekDate ?? new Date().toISOString().slice(0, 10));

  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .eq("status", "paid");

  if (error) return { error: error.message };

  const weekOrders = filterOrdersInWeek((orders ?? []) as Order[], period);
  const address = [restaurant.street_address, restaurant.city, restaurant.state, restaurant.zip]
    .filter(Boolean)
    .join(", ");

  return {
    data: buildCheckStubFromOrders(weekOrders, {
      restaurantName: restaurant.name,
      restaurantAddress: address,
      period,
      commissionBps,
    }),
  };
}

export async function getRestaurantDailySummaries(
  restaurantId: string,
  limit = 30
): Promise<{ data: DailyRestaurantSummary[] } | { error: string }> {
  const auth = await requireProfileRole(["restaurant_manager", "admin"]);
  if ("error" in auth) return { error: auth.error };

  const allowed = await assertRestaurantAccess(
    restaurantId,
    auth.profile.role,
    auth.profile.id
  );
  if (!allowed) return { error: "Unauthorized" };

  const supabase = await createClient();
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*, daily_lunch_schedules(lunch_date)")
    .eq("restaurant_id", restaurantId)
    .eq("status", "paid");

  if (error) return { error: error.message };

  type Row = Order & { daily_lunch_schedules?: { lunch_date: string } | null };
  const rows = (orders ?? []) as Row[];
  const summaries = summarizeOrdersByDay(rows, (o) => {
    const row = o as Row;
    return row.daily_lunch_schedules?.lunch_date ?? row.created_at.slice(0, 10);
  }).slice(0, limit);

  return { data: summaries };
}

export async function getRestaurantLifetimeTotals(
  restaurantId: string
): Promise<
  | {
      data: {
        orderCount: number;
        subtotalCents: number;
        grossSalesCents: number;
        payoutCents: number;
        commissionCents: number;
      };
    }
  | { error: string }
> {
  const auth = await requireProfileRole(["restaurant_manager", "admin"]);
  if ("error" in auth) return { error: auth.error };

  const allowed = await assertRestaurantAccess(
    restaurantId,
    auth.profile.role,
    auth.profile.id
  );
  if (!allowed) return { error: "Unauthorized" };

  const supabase = await createClient();
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .eq("status", "paid");

  if (error) return { error: error.message };

  let orderCount = 0;
  let subtotalCents = 0;
  let grossSalesCents = 0;
  let payoutCents = 0;
  let commissionCents = 0;

  for (const o of orders ?? []) {
    orderCount += 1;
    subtotalCents += o.subtotal_cents;
    grossSalesCents += o.subtotal_cents + o.tax_cents + (o.gratuity_cents ?? 0);
    payoutCents += o.payout_due_cents;
    commissionCents += o.restaurant_commission_cents ?? 0;
  }

  return {
    data: { orderCount, subtotalCents, grossSalesCents, payoutCents, commissionCents },
  };
}
