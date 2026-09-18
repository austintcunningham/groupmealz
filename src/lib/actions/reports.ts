"use server";

import { createClient } from "@/lib/supabase/server";
import { requireProfileRole } from "@/lib/actions/utils";
import type {
  AdminDashboardTotals,
  ProductionSheetItem,
} from "@/types/database";

export async function getProductionSheet(
  scheduleId: string
): Promise<{ data: ProductionSheetItem[] } | { error: string }> {
  const auth = await requireProfileRole(["restaurant_manager", "admin"]);
  if ("error" in auth) return { error: auth.error };

  const supabase = await createClient();

  const { data: schedule } = await supabase
    .from("daily_lunch_schedules")
    .select("*")
    .eq("id", scheduleId)
    .single();

  if (!schedule) return { error: "Schedule not found" };

  if (auth.profile.role === "restaurant_manager") {
    const { data: link } = await supabase
      .from("restaurant_users")
      .select("id")
      .eq("restaurant_id", schedule.restaurant_id)
      .eq("user_id", auth.profile.id)
      .maybeSingle();

    if (!link) return { error: "Unauthorized" };
  }

  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, customer_name, order_items(*)")
    .eq("schedule_id", scheduleId)
    .in("status", ["paid", "authorized"]);

  if (error) return { error: error.message };

  type OrderRow = {
    id: string;
    customer_name: string;
    order_items: {
      menu_item_id: string | null;
      item_name_snapshot: string;
      quantity: number;
      special_instructions: string | null;
    }[];
  };

  const grouped = new Map<string, ProductionSheetItem>();

  for (const order of (orders ?? []) as OrderRow[]) {
    for (const item of order.order_items ?? []) {
      const key = item.menu_item_id ?? item.item_name_snapshot;
      const existing = grouped.get(key) ?? {
        menuItemId: item.menu_item_id,
        itemName: item.item_name_snapshot,
        totalQuantity: 0,
        orders: [],
      };
      existing.totalQuantity += item.quantity;
      existing.orders.push({
        orderId: order.id,
        customerName: order.customer_name,
        quantity: item.quantity,
        specialInstructions: item.special_instructions,
      });
      grouped.set(key, existing);
    }
  }

  return {
    data: Array.from(grouped.values()).sort((a, b) =>
      a.itemName.localeCompare(b.itemName)
    ),
  };
}

export async function getAdminDashboardTotals(): Promise<
  { data: AdminDashboardTotals } | { error: string }
> {
  const auth = await requireProfileRole(["admin"]);
  if ("error" in auth) return { error: auth.error };

  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: todaySchedules } = await supabase
    .from("daily_lunch_schedules")
    .select("id")
    .eq("lunch_date", today);

  const { data: paidOrders, error } = await supabase
    .from("orders")
    .select("*, restaurants(id, name)")
    .eq("status", "paid");

  if (error) return { error: error.message };

  const orders = paidOrders ?? [];
  const restaurantMap = new Map<
    string,
    { restaurantId: string; restaurantName: string; orderCount: number; salesCents: number }
  >();

  let totalSalesCents = 0;
  let totalPlatformFeesCents = 0;
  let totalPayoutDueCents = 0;

  for (const order of orders) {
    totalSalesCents += order.total_cents;
    totalPlatformFeesCents += order.platform_fee_cents;
    totalPayoutDueCents += order.payout_due_cents;

    const restaurant = order.restaurants as
      | { id: string; name: string }
      | { id: string; name: string }[]
      | null;
    const restaurantRecord = Array.isArray(restaurant) ? restaurant[0] : restaurant;
    const restaurantId = order.restaurant_id;
    const restaurantName = restaurantRecord?.name ?? "Unknown";
    const existing = restaurantMap.get(restaurantId) ?? {
      restaurantId,
      restaurantName,
      orderCount: 0,
      salesCents: 0,
    };
    existing.orderCount += 1;
    existing.salesCents += order.total_cents;
    restaurantMap.set(restaurantId, existing);
  }

  return {
    data: {
      todaySchedules: todaySchedules?.length ?? 0,
      paidOrderCount: orders.length,
      totalSalesCents,
      totalPlatformFeesCents,
      totalPayoutDueCents,
      ordersByRestaurant: Array.from(restaurantMap.values()).sort(
        (a, b) => b.salesCents - a.salesCents
      ),
    },
  };
}
