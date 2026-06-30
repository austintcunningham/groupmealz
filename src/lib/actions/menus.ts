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

const menuItemSchema = z.object({
  restaurant_id: z.string().uuid(),
  category_id: z.string().uuid().nullable().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  price_cents: z.number().int().min(0),
  active: z.boolean().optional(),
  available: z.boolean().optional(),
  display_order: z.number().int().optional(),
});

export async function createMenuCategory(
  input: z.infer<typeof categorySchema>
): Promise<ActionResult<{ id: string }>> {
  const auth = await requireProfileRole(["admin"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("menu_categories")
    .insert(parsed.data)
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  await logAudit("create_menu_category", "menu_category", data.id);
  revalidatePath("/admin/menus");
  return { success: true, data: { id: data.id } };
}

export async function createMenuItem(
  input: z.infer<typeof menuItemSchema>
): Promise<ActionResult<{ id: string }>> {
  const auth = await requireProfileRole(["admin"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const parsed = menuItemSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("menu_items")
    .insert(parsed.data)
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  await logAudit("create_menu_item", "menu_item", data.id);
  revalidatePath("/admin/menus");
  return { success: true, data: { id: data.id } };
}
