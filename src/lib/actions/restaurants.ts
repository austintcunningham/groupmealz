"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  logAudit,
  requireProfileRole,
  type ActionResult,
} from "@/lib/actions/utils";

const restaurantSchema = z.object({
  name: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  street_address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  active: z.boolean().optional(),
});

export async function createRestaurant(
  input: z.infer<typeof restaurantSchema>
): Promise<ActionResult<{ id: string }>> {
  const auth = await requireProfileRole(["admin"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const parsed = restaurantSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("restaurants")
    .insert({
      ...parsed.data,
      email: parsed.data.email || null,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  await logAudit("create_restaurant", "restaurant", data.id);
  revalidatePath("/admin/restaurants");
  return { success: true, data: { id: data.id } };
}

export async function updateRestaurant(
  id: string,
  input: z.infer<typeof restaurantSchema>
): Promise<ActionResult> {
  const auth = await requireProfileRole(["admin"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const parsed = restaurantSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("restaurants")
    .update({
      ...parsed.data,
      email: parsed.data.email || null,
    })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  await logAudit("update_restaurant", "restaurant", id);
  revalidatePath("/admin/restaurants");
  return { success: true, data: undefined };
}

const brandingSchema = z.object({
  logo_url: z.string().url().optional().or(z.literal("")),
  banner_url: z.string().url().optional().or(z.literal("")),
  branding_status: z.enum(["pending", "approved", "rejected"]).optional(),
});

export async function updateRestaurantBranding(
  id: string,
  input: z.infer<typeof brandingSchema>
): Promise<ActionResult> {
  const auth = await requireProfileRole(["admin", "restaurant_manager"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const parsed = brandingSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();

  if (auth.profile.role === "restaurant_manager") {
    const { data: link } = await supabase
      .from("restaurant_users")
      .select("id")
      .eq("restaurant_id", id)
      .eq("user_id", auth.profile.id)
      .maybeSingle();
    if (!link) return { success: false, error: "Unauthorized" };

    const { error } = await supabase
      .from("restaurants")
      .update({
        logo_url: parsed.data.logo_url || null,
        banner_url: parsed.data.banner_url || null,
        branding_status: "pending",
      })
      .eq("id", id);
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase
      .from("restaurants")
      .update({
        logo_url: parsed.data.logo_url || null,
        banner_url: parsed.data.banner_url || null,
        ...(parsed.data.branding_status ? { branding_status: parsed.data.branding_status } : {}),
      })
      .eq("id", id);
    if (error) return { success: false, error: error.message };
  }

  revalidatePath("/admin/restaurants");
  revalidatePath("/restaurant/branding");
  revalidatePath("/order");
  return { success: true, data: undefined };
}

export async function assignRestaurantManagerByEmail(
  restaurantId: string,
  email: string
): Promise<ActionResult<{ status: "assigned" | "invited"; email: string }>> {
  const auth = await requireProfileRole(["admin"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const { upsertStaffInvitation, normalizeStaffEmail } = await import("@/lib/staff/invitations");
  const normalized = normalizeStaffEmail(email);
  if (!normalized) {
    return { success: false, error: "Email is required." };
  }

  const result = await upsertStaffInvitation({
    kind: "restaurant_manager",
    email: normalized,
    restaurantId,
    createdBy: auth.profile.id,
  });

  if ("error" in result) {
    return { success: false, error: result.error };
  }

  revalidatePath("/admin/restaurants");
  revalidatePath("/admin/settings");
  revalidatePath("/restaurant");
  return { success: true, data: { status: result.status, email: result.email } };
}
