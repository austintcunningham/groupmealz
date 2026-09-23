"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requireProfileRole, type ActionResult } from "@/lib/actions/utils";
import { getRelationName } from "@/lib/supabase/relation";
import type { RestaurantReview } from "@/types/database";

const submitReviewSchema = z.object({
  orderId: z.string().uuid(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
  emailConfirm: z.string().email().optional(),
});

export type ReviewOrderContext = {
  orderId: string;
  restaurantName: string;
  officeName: string;
  lunchDate: string;
  customerName: string;
  alreadyReviewed: boolean;
  requiresEmailConfirm: boolean;
};

export async function getReviewOrderContext(
  orderId: string
): Promise<ActionResult<ReviewOrderContext>> {
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { success: false, error: "Reviews are temporarily unavailable." };
  }

  const { data: order, error } = await admin
    .from("orders")
    .select(
      "id, status, customer_name, customer_email, user_id, restaurants(name), offices(name), daily_lunch_schedules(lunch_date)"
    )
    .eq("id", orderId)
    .single();

  if (error || !order) {
    return { success: false, error: "Order not found." };
  }
  if (order.status !== "paid") {
    return { success: false, error: "You can review after payment is complete." };
  }

  const { data: existing } = await admin
    .from("restaurant_reviews")
    .select("id")
    .eq("order_id", orderId)
    .maybeSingle();

  const schedule = order.daily_lunch_schedules as
    | { lunch_date: string }
    | { lunch_date: string }[]
    | null;
  const lunchDate = (Array.isArray(schedule) ? schedule[0] : schedule)?.lunch_date ?? "";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ownsOrder = Boolean(user && order.user_id && user.id === order.user_id);
  const guestOrder = !order.user_id;

  return {
    success: true,
    data: {
      orderId: order.id,
      restaurantName: getRelationName(order.restaurants) ?? "Restaurant",
      officeName: getRelationName(order.offices) ?? "Office",
      lunchDate,
      customerName: order.customer_name,
      alreadyReviewed: Boolean(existing),
      requiresEmailConfirm: guestOrder && !ownsOrder,
    },
  };
}

export async function submitRestaurantReview(
  input: z.infer<typeof submitReviewSchema>
): Promise<ActionResult<{ id: string }>> {
  const parsed = submitReviewSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid review" };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { success: false, error: "Reviews are temporarily unavailable." };
  }

  const { data: order, error: orderError } = await admin
    .from("orders")
    .select("id, status, customer_name, customer_email, user_id, restaurant_id, office_id")
    .eq("id", parsed.data.orderId)
    .single();

  if (orderError || !order) {
    return { success: false, error: "Order not found." };
  }
  if (order.status !== "paid") {
    return { success: false, error: "Only paid orders can be reviewed." };
  }

  const { data: existing } = await admin
    .from("restaurant_reviews")
    .select("id")
    .eq("order_id", order.id)
    .maybeSingle();
  if (existing) {
    return { success: false, error: "This order was already reviewed." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (order.user_id) {
    if (!user || user.id !== order.user_id) {
      return { success: false, error: "Sign in with the account used for this order." };
    }
  } else {
    const confirm = parsed.data.emailConfirm?.trim().toLowerCase();
    const orderEmail = order.customer_email?.trim().toLowerCase();
    if (!confirm || !orderEmail || confirm !== orderEmail) {
      return {
        success: false,
        error: "Enter the same email you used at checkout to verify this order.",
      };
    }
  }

  const comment = (parsed.data.comment ?? "").trim();

  const { data: review, error: insertError } = await admin
    .from("restaurant_reviews")
    .insert({
      order_id: order.id,
      restaurant_id: order.restaurant_id,
      office_id: order.office_id,
      user_id: user?.id ?? null,
      reviewer_name: order.customer_name,
      rating: parsed.data.rating,
      comment,
    })
    .select("id")
    .single();

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  revalidatePath("/admin/reviews");
  revalidatePath("/restaurant/reports");
  revalidatePath(`/review/${order.id}`);
  revalidatePath(`/app/orders/${order.id}`);

  return { success: true, data: { id: review.id } };
}

export async function listRestaurantReviewsForAdmin(
  restaurantId?: string,
  limit = 50
): Promise<
  ActionResult<
    (RestaurantReview & {
      restaurants: { name: string } | null;
      offices: { name: string } | null;
    })[]
  >
> {
  const auth = await requireProfileRole(["admin"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const supabase = await createClient();
  let query = supabase
    .from("restaurant_reviews")
    .select("*, restaurants(name), offices(name)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (restaurantId) {
    query = query.eq("restaurant_id", restaurantId);
  }

  const { data, error } = await query;
  if (error) return { success: false, error: error.message };
  return { success: true, data: (data ?? []) as never };
}

export async function listRestaurantReviewsForManager(
  restaurantId: string,
  limit = 30
): Promise<
  ActionResult<
    (RestaurantReview & {
      offices: { name: string } | null;
    })[]
  >
> {
  const auth = await requireProfileRole(["restaurant_manager", "admin"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("restaurant_reviews")
    .select("*, offices(name)")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return { success: false, error: error.message };
  return { success: true, data: (data ?? []) as never };
}

export async function getRestaurantReviewSummary(restaurantId: string): Promise<{
  count: number;
  averageRating: number | null;
}> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("restaurant_reviews")
    .select("rating")
    .eq("restaurant_id", restaurantId);

  const rows = data ?? [];
  if (!rows.length) return { count: 0, averageRating: null };
  const sum = rows.reduce((s, r) => s + r.rating, 0);
  return { count: rows.length, averageRating: Math.round((sum / rows.length) * 10) / 10 };
}
