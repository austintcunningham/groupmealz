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

export async function assignRestaurantManager(
  restaurantId: string,
  userId: string
): Promise<ActionResult> {
  const auth = await requireProfileRole(["admin"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const supabase = await createClient();

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ role: "restaurant_manager" })
    .eq("id", userId);

  if (profileError) return { success: false, error: profileError.message };

  const { error } = await supabase.from("restaurant_users").upsert(
    { restaurant_id: restaurantId, user_id: userId },
    { onConflict: "restaurant_id,user_id" }
  );

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/restaurants");
  return { success: true, data: undefined };
}
