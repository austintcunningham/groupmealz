"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  logAudit,
  requireProfileRole,
  type ActionResult,
} from "@/lib/actions/utils";

const categorySchema = z.object({
  restaurant_id: z.string().uuid(),
  name: z.string().min(1),
  display_order: z.number().int().optional(),
  active: z.boolean().optional(),
});

const updateMenuCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  display_order: z.number().int().optional(),
  active: z.boolean().optional(),
});

const menuItemSchema = z.object({
  restaurant_id: z.string().uuid(),
  category_id: z.string().uuid().nullable().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  price_cents: z.number().int().min(0),
  active: z.boolean().optional(),
  available: z.boolean().optional(),
  display_order: z.number().int().optional(),
  counts_as_entree: z.boolean().optional(),
  promo_label: z.string().max(120).nullable().optional(),
  promo_price_cents: z.number().int().min(0).nullable().optional(),
  promo_ends_at: z.string().nullable().optional(),
});

const updateMenuItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  price_cents: z.number().int().min(0).optional(),
  category_id: z.string().uuid().nullable().optional(),
  available: z.boolean().optional(),
  active: z.boolean().optional(),
  counts_as_entree: z.boolean().optional(),
  promo_label: z.string().max(120).nullable().optional(),
  promo_price_cents: z.number().int().min(0).nullable().optional(),
  promo_ends_at: z.string().nullable().optional(),
});

async function assertRestaurantMenuAccess(
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

async function getCategoryRestaurantId(categoryId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("menu_categories")
    .select("restaurant_id")
    .eq("id", categoryId)
    .maybeSingle();
  return data?.restaurant_id ?? null;
}

async function getMenuItemRestaurantId(itemId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("menu_items")
    .select("restaurant_id")
    .eq("id", itemId)
    .maybeSingle();
  return data?.restaurant_id ?? null;
}

function revalidateMenuPaths() {
  revalidatePath("/admin/menus");
  revalidatePath("/restaurant/menu");
  revalidatePath("/order");
}

export async function createMenuCategory(
  input: z.infer<typeof categorySchema>
): Promise<ActionResult<{ id: string }>> {
  const auth = await requireProfileRole(["admin", "restaurant_manager"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const allowed = await assertRestaurantMenuAccess(
    parsed.data.restaurant_id,
    auth.profile.role,
    auth.profile.id
  );
  if (!allowed) return { success: false, error: "Unauthorized" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("menu_categories")
    .insert(parsed.data)
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  await logAudit("create_menu_category", "menu_category", data.id);
  revalidateMenuPaths();
  return { success: true, data: { id: data.id } };
}

export async function updateMenuCategory(
  input: z.infer<typeof updateMenuCategorySchema>
): Promise<ActionResult> {
  const auth = await requireProfileRole(["admin", "restaurant_manager"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const parsed = updateMenuCategorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const restaurantId = await getCategoryRestaurantId(parsed.data.id);
  if (!restaurantId) return { success: false, error: "Category not found" };

  const allowed = await assertRestaurantMenuAccess(
    restaurantId,
    auth.profile.role,
    auth.profile.id
  );
  if (!allowed) return { success: false, error: "Unauthorized" };

  const { id, ...patch } = parsed.data;
  if (Object.keys(patch).length === 0) {
    return { success: false, error: "Nothing to update" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("menu_categories").update(patch).eq("id", id);

  if (error) return { success: false, error: error.message };

  await logAudit("update_menu_category", "menu_category", id);
  revalidateMenuPaths();
  return { success: true, data: undefined };
}

export async function deleteMenuCategory(categoryId: string): Promise<ActionResult> {
  const auth = await requireProfileRole(["admin", "restaurant_manager"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const parsedId = z.string().uuid().safeParse(categoryId);
  if (!parsedId.success) {
    return { success: false, error: "Invalid category" };
  }

  const restaurantId = await getCategoryRestaurantId(parsedId.data);
  if (!restaurantId) return { success: false, error: "Category not found" };

  const allowed = await assertRestaurantMenuAccess(
    restaurantId,
    auth.profile.role,
    auth.profile.id
  );
  if (!allowed) return { success: false, error: "Unauthorized" };

  const supabase = await createClient();
  const { error } = await supabase.from("menu_categories").delete().eq("id", parsedId.data);

  if (error) return { success: false, error: error.message };

  await logAudit("delete_menu_category", "menu_category", parsedId.data);
  revalidateMenuPaths();
  return { success: true, data: undefined };
}

export async function createMenuItem(
  input: z.infer<typeof menuItemSchema>
): Promise<ActionResult<{ id: string }>> {
  const auth = await requireProfileRole(["admin", "restaurant_manager"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const parsed = menuItemSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const allowed = await assertRestaurantMenuAccess(
    parsed.data.restaurant_id,
    auth.profile.role,
    auth.profile.id
  );
  if (!allowed) return { success: false, error: "Unauthorized" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("menu_items")
    .insert(parsed.data)
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  await logAudit("create_menu_item", "menu_item", data.id);
  revalidateMenuPaths();
  return { success: true, data: { id: data.id } };
}

export async function updateMenuItem(
  input: z.infer<typeof updateMenuItemSchema>
): Promise<ActionResult> {
  const auth = await requireProfileRole(["admin", "restaurant_manager"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const parsed = updateMenuItemSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const restaurantId = await getMenuItemRestaurantId(parsed.data.id);
  if (!restaurantId) return { success: false, error: "Menu item not found" };

  const allowed = await assertRestaurantMenuAccess(
    restaurantId,
    auth.profile.role,
    auth.profile.id
  );
  if (!allowed) return { success: false, error: "Unauthorized" };

  const { id, ...patch } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.from("menu_items").update(patch).eq("id", id);

  if (error) return { success: false, error: error.message };

  await logAudit("update_menu_item", "menu_item", id);
  revalidateMenuPaths();
  return { success: true, data: undefined };
}
