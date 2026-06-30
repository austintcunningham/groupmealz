"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { calculateOrderTotals } from "@/lib/fees/calculate";
import { createClient } from "@/lib/supabase/server";
import { getStripe, getAppUrl } from "@/lib/stripe/client";
import {
  getAuthenticatedProfile,
  requireProfileRole,
  type ActionResult,
} from "@/lib/actions/utils";
import type { PlatformSettings } from "@/types/database";

const orderItemInputSchema = z.object({
  menuItemId: z.string().uuid(),
  quantity: z.number().int().min(1),
  specialInstructions: z.string().optional(),
});

const createOrderSchema = z.object({
  scheduleId: z.string().uuid(),
  items: z.array(orderItemInputSchema).min(1),
});

export async function createOrder(
  input: z.infer<typeof createOrderSchema>
): Promise<ActionResult<{ orderId: string }>> {
  const auth = await requireProfileRole(["employee", "admin"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const parsed = createOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const profile = auth.profile;

  const { data: schedule, error: scheduleError } = await supabase
    .from("daily_lunch_schedules")
    .select("*")
    .eq("id", parsed.data.scheduleId)
    .single();

  if (scheduleError || !schedule) {
    return { success: false, error: "Schedule not found" };
  }

  if (schedule.status !== "open") {
    return { success: false, error: "Ordering is not open for this schedule" };
  }

  if (new Date(schedule.order_cutoff_at) <= new Date()) {
    return { success: false, error: "Order cutoff has passed" };
  }

  const menuItemIds = parsed.data.items.map((i) => i.menuItemId);
  const { data: menuItems, error: menuError } = await supabase
    .from("menu_items")
    .select("*")
    .in("id", menuItemIds)
    .eq("restaurant_id", schedule.restaurant_id)
    .eq("active", true)
    .eq("available", true);

  if (menuError || !menuItems?.length) {
    return { success: false, error: "Menu items unavailable" };
  }

  const menuMap = new Map(menuItems.map((m) => [m.id, m]));
  let subtotalCents = 0;
  const lineItems = parsed.data.items.map((item) => {
    const menuItem = menuMap.get(item.menuItemId);
    if (!menuItem) {
      throw new Error("Invalid menu item");
    }
    const lineTotal = menuItem.price_cents * item.quantity;
    subtotalCents += lineTotal;
    return {
      menu_item_id: menuItem.id,
      item_name_snapshot: menuItem.name,
      base_price_cents: menuItem.price_cents,
      quantity: item.quantity,
      special_instructions: item.specialInstructions ?? null,
      line_total_cents: lineTotal,
    };
  });

  const { data: settingsRow } = await supabase
    .from("platform_settings")
    .select("*")
    .limit(1)
    .single();

  const settings = (settingsRow ?? {
    platform_fee_type: "flat",
    flat_fee_cents: 250,
    percentage_bps: 0,
    sales_tax_bps: 0,
  }) as PlatformSettings;

  const totals = calculateOrderTotals(subtotalCents, settings);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      schedule_id: schedule.id,
      office_id: schedule.office_id,
      restaurant_id: schedule.restaurant_id,
      user_id: profile.id,
      customer_name: profile.full_name || profile.email,
      customer_email: profile.email,
      subtotal_cents: totals.subtotalCents,
      tax_cents: totals.taxCents,
      platform_fee_cents: totals.platformFeeCents,
      total_cents: totals.totalCents,
      payout_due_cents: totals.payoutDueCents,
      status: "pending_payment",
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return { success: false, error: orderError?.message ?? "Failed to create order" };
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    lineItems.map((li) => ({ ...li, order_id: order.id }))
  );

  if (itemsError) {
    await supabase.from("orders").delete().eq("id", order.id);
    return { success: false, error: itemsError.message };
  }

  revalidatePath("/app/orders");
  return { success: true, data: { orderId: order.id } };
}

export async function createCheckoutSession(
  orderId: string
): Promise<ActionResult<{ url: string }>> {
  const profile = await getAuthenticatedProfile();
  if (!profile) return { success: false, error: "Not authenticated" };

  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", orderId)
    .single();

  if (error || !order) {
    return { success: false, error: "Order not found" };
  }

  if (order.user_id !== profile.id && profile.role !== "admin") {
    return { success: false, error: "Unauthorized" };
  }

  if (order.status !== "pending_payment") {
    return { success: false, error: "Order is not payable" };
  }

  const stripe = getStripe();
  const appUrl = getAppUrl();

  // Stripe Checkout collects payment — we never handle card data.
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: order.customer_email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Office Lunch Order",
            description: `Order ${order.id.slice(0, 8)}`,
          },
          unit_amount: order.total_cents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      order_id: order.id,
    },
    success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/checkout/cancel?order_id=${order.id}`,
  });

  const { error: updateError } = await supabase
    .from("orders")
    .update({
      stripe_checkout_session_id: session.id,
      payment_status: session.payment_status ?? "unpaid",
    })
    .eq("id", order.id);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  if (!session.url) {
    return { success: false, error: "Failed to create checkout session" };
  }

  return { success: true, data: { url: session.url } };
}

const settingsSchema = z.object({
  platform_fee_type: z.enum(["flat", "percentage", "hybrid"]),
  flat_fee_cents: z.number().int().min(0),
  percentage_bps: z.number().int().min(0),
  sales_tax_bps: z.number().int().min(0),
});

export async function updatePlatformSettings(
  id: string,
  input: z.infer<typeof settingsSchema>
): Promise<ActionResult> {
  const auth = await requireProfileRole(["admin"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("platform_settings")
    .update(parsed.data)
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/settings");
  return { success: true, data: undefined };
}
