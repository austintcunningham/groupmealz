"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { calculateOrderTotals } from "@/lib/fees/calculate";
import { sendRestaurantOrderEmail } from "@/lib/email/restaurant";
import { getOrCreateStripeCustomer, savePaymentMethodRecord } from "@/lib/stripe/customers";
import { isOrderingWindowOpen } from "@/lib/scheduling/window";
import { getStripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
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

const checkoutAccountSchema = z.object({
  scheduleId: z.string().uuid(),
  items: z.array(orderItemInputSchema).min(1),
  fullName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6).optional(),
  officeId: z.string().uuid().optional(),
});

const checkoutGuestSchema = z.object({
  scheduleId: z.string().uuid(),
  officeId: z.string().uuid(),
  items: z.array(orderItemInputSchema).min(1),
  fullName: z.string().min(1),
  email: z.string().email(),
});

async function buildOrderFromItems(
  scheduleId: string,
  items: z.infer<typeof orderItemInputSchema>[],
  userId: string | null,
  customerName: string,
  customerEmail: string,
  options?: { expectedOfficeId?: string; useAdmin?: boolean }
): Promise<ActionResult<{ orderId: string; totalCents: number }>> {
  const supabase = options?.useAdmin ? createAdminClient() : await createClient();

  const { data: schedule } = await supabase
    .from("daily_lunch_schedules")
    .select("*")
    .eq("id", scheduleId)
    .single();

  if (!schedule) return { success: false, error: "Schedule not found" };
  if (options?.expectedOfficeId && schedule.office_id !== options.expectedOfficeId) {
    return { success: false, error: "Invalid office for this schedule" };
  }
  if (!isOrderingWindowOpen(schedule)) {
    return { success: false, error: "Ordering is not open for this lunch" };
  }

  const menuItemIds = items.map((i) => i.menuItemId);
  const { data: menuItems } = await supabase
    .from("menu_items")
    .select("*")
    .in("id", menuItemIds)
    .eq("restaurant_id", schedule.restaurant_id)
    .eq("active", true)
    .eq("available", true);

  if (!menuItems?.length) return { success: false, error: "Menu items unavailable" };

  const menuMap = new Map(menuItems.map((m) => [m.id, m]));
  let subtotalCents = 0;
  const lineItems = items.map((item) => {
    const menuItem = menuMap.get(item.menuItemId);
    if (!menuItem) throw new Error("Invalid menu item");
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
      user_id: userId,
      customer_name: customerName,
      customer_email: customerEmail,
      subtotal_cents: totals.subtotalCents,
      tax_cents: totals.taxCents,
      platform_fee_cents: totals.platformFeeCents,
      total_cents: totals.totalCents,
      payout_due_cents: totals.payoutDueCents,
      status: "pending_payment",
    })
    .select("id, total_cents")
    .single();

  if (orderError || !order) {
    return { success: false, error: orderError?.message ?? "Failed to create order" };
  }

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(lineItems.map((li) => ({ ...li, order_id: order.id })));

  if (itemsError) {
    await supabase.from("orders").delete().eq("id", order.id);
    return { success: false, error: itemsError.message };
  }

  return { success: true, data: { orderId: order.id, totalCents: order.total_cents } };
}

export async function createOrder(
  input: z.infer<typeof createOrderSchema>
): Promise<ActionResult<{ orderId: string }>> {
  const auth = await requireProfileRole(["employee", "admin", "office_admin"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const parsed = createOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const result = await buildOrderFromItems(
    parsed.data.scheduleId,
    parsed.data.items,
    auth.profile.id,
    auth.profile.full_name || auth.profile.email,
    auth.profile.email
  );

  if (!result.success) return result;
  revalidatePath("/app/orders");
  return { success: true, data: { orderId: result.data.orderId } };
}

/** Guest checkout — no account (Major Menus style) */
export async function checkoutGuest(
  input: z.infer<typeof checkoutGuestSchema>
): Promise<ActionResult<{ orderId: string }>> {
  const parsed = checkoutGuestSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const result = await buildOrderFromItems(
    parsed.data.scheduleId,
    parsed.data.items,
    null,
    parsed.data.fullName,
    parsed.data.email,
    { expectedOfficeId: parsed.data.officeId, useAdmin: true }
  );

  if (!result.success) return result;
  return { success: true, data: { orderId: result.data.orderId } };
}

/** @deprecated Use checkoutGuest for public ordering */
export async function checkoutWithAccount(
  input: z.infer<typeof checkoutAccountSchema>
): Promise<ActionResult<{ orderId: string }>> {
  const parsed = checkoutAccountSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  let profile = await getAuthenticatedProfile();
  const supabase = await createClient();

  if (!profile) {
    if (!parsed.data.password) {
      return { success: false, error: "Password required to create an account" };
    }
    const admin = createAdminClient();
    const { data: authData, error: signUpError } = await admin.auth.admin.createUser({
      email: parsed.data.email,
      password: parsed.data.password,
      email_confirm: true,
      user_metadata: { full_name: parsed.data.fullName, role: "employee" },
    });
    if (signUpError || !authData.user) {
      return { success: false, error: signUpError?.message ?? "Could not create account" };
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    if (signInError) return { success: false, error: signInError.message };

    profile = await getAuthenticatedProfile();
    if (!profile) return { success: false, error: "Account created but session failed" };

    if (parsed.data.officeId) {
      await admin.from("office_users").upsert(
        { office_id: parsed.data.officeId, user_id: profile.id, role: "employee" },
        { onConflict: "office_id,user_id" }
      );
    }
  }

  const result = await buildOrderFromItems(
    parsed.data.scheduleId,
    parsed.data.items,
    profile.id,
    parsed.data.fullName,
    parsed.data.email
  );

  if (!result.success) return result;
  revalidatePath("/app/orders");
  return { success: true, data: { orderId: result.data.orderId } };
}

/** Embedded Stripe PaymentIntent — verifies card immediately, captures on confirm */
export async function createPaymentIntent(
  orderId: string,
  options?: { saveCard?: boolean; guestEmail?: string } | boolean
): Promise<
  ActionResult<{ clientSecret: string; customerId: string; publishableKey: string }>
> {
  const opts =
    typeof options === "boolean" ? { saveCard: options } : (options ?? { saveCard: true });
  const saveCard = opts.saveCard ?? true;
  const guestEmail = opts.guestEmail?.trim().toLowerCase();
  const profile = await getAuthenticatedProfile();
  const supabase = createAdminClient();

  const { data: order } = await supabase.from("orders").select("*").eq("id", orderId).single();

  if (!order) return { success: false, error: "Order not found" };
  if (order.status !== "pending_payment") {
    return { success: false, error: "Order is not payable" };
  }

  if (order.user_id) {
    if (!profile) return { success: false, error: "Not authenticated" };
    if (order.user_id !== profile.id && profile.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }
  } else if (guestEmail) {
    if (order.customer_email.trim().toLowerCase() !== guestEmail) {
      return { success: false, error: "Email does not match this order" };
    }
  } else {
    return { success: false, error: "Not authorized to pay for this order" };
  }

  const stripe = getStripe();
  let customerId: string;

  if (profile && order.user_id) {
    customerId = await getOrCreateStripeCustomer(profile);
  } else {
    const existing = await stripe.customers.list({ email: order.customer_email, limit: 1 });
    customerId =
      existing.data[0]?.id ??
      (
        await stripe.customers.create({
          email: order.customer_email,
          name: order.customer_name,
          metadata: { guest_order: "true" },
        })
      ).id;
  }

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

  const intent = await stripe.paymentIntents.create({
    amount: order.total_cents,
    currency: "usd",
    customer: customerId,
    capture_method: "automatic",
    payment_method_types: ["card"],
    setup_future_usage:
      profile && order.user_id && saveCard ? "off_session" : undefined,
    metadata: { order_id: order.id, return_url: `${appUrl}/checkout/success?order_id=${order.id}` },
  });

  await supabase
    .from("orders")
    .update({
      stripe_payment_intent_id: intent.id,
      payment_status: intent.status,
    })
    .eq("id", order.id);

  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!publishableKey) return { success: false, error: "Stripe publishable key missing" };
  if (!intent.client_secret) return { success: false, error: "Failed to create payment intent" };

  return {
    success: true,
    data: { clientSecret: intent.client_secret, customerId, publishableKey },
  };
}

export async function confirmPaymentSaved(
  orderId: string,
  paymentMethodId?: string
): Promise<ActionResult> {
  const profile = await getAuthenticatedProfile();
  if (!profile) return { success: false, error: "Not authenticated" };

  if (paymentMethodId) {
    await savePaymentMethodRecord(profile.id, paymentMethodId);
  }

  revalidatePath(`/app/orders/${orderId}`);
  revalidatePath("/app/orders");
  return { success: true, data: undefined };
}

export async function getSavedPaymentMethods() {
  const profile = await getAuthenticatedProfile();
  if (!profile) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("saved_payment_methods")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function deleteSavedPaymentMethod(id: string): Promise<ActionResult> {
  const profile = await getAuthenticatedProfile();
  if (!profile) return { success: false, error: "Not authenticated" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("saved_payment_methods")
    .delete()
    .eq("id", id)
    .eq("user_id", profile.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/app/settings");
  return { success: true, data: undefined };
}

const settingsSchema = z.object({
  platform_fee_type: z.enum(["flat", "percentage", "hybrid"]),
  flat_fee_cents: z.number().int().min(0),
  percentage_bps: z.number().int().min(0),
  sales_tax_bps: z.number().int().min(0),
  advance_order_hours: z.number().int().min(1).max(168).optional(),
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
  const { error } = await supabase.from("platform_settings").update(parsed.data).eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/settings");
  return { success: true, data: undefined };
}

export { sendRestaurantOrderEmail };
