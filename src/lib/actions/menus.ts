"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  logAudit,
  requireProfileRole,
  type ActionResult,
} from "@/lib/actions/utils";
import {
  MENU_IMAGES_BUCKET,
  menuImageObjectPath,
  menuImagePathFromPublicUrl,
  validateMenuImageFile,
} from "@/lib/storage/menu-images";

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

async function removeStoredMenuImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  imageUrl: string | null | undefined
): Promise<void> {
  const path = imageUrl ? menuImagePathFromPublicUrl(imageUrl) : null;
  if (!path) return;
  await supabase.storage.from(MENU_IMAGES_BUCKET).remove([path]);
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

export async function deleteMenuItem(itemId: string): Promise<ActionResult> {
  const auth = await requireProfileRole(["admin", "restaurant_manager"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const parsedId = z.string().uuid().safeParse(itemId);
  if (!parsedId.success) {
    return { success: false, error: "Invalid menu item" };
  }

  const restaurantId = await getMenuItemRestaurantId(parsedId.data);
  if (!restaurantId) return { success: false, error: "Menu item not found" };

  const allowed = await assertRestaurantMenuAccess(
    restaurantId,
    auth.profile.role,
    auth.profile.id
  );
  if (!allowed) return { success: false, error: "Unauthorized" };

  const supabase = await createClient();
  const { data: itemRow } = await supabase
    .from("menu_items")
    .select("image_url")
    .eq("id", parsedId.data)
    .maybeSingle();

  const { error } = await supabase.from("menu_items").delete().eq("id", parsedId.data);

  if (error) return { success: false, error: error.message };

  await removeStoredMenuImage(supabase, itemRow?.image_url);

  await logAudit("delete_menu_item", "menu_item", parsedId.data);
  revalidateMenuPaths();
  return { success: true, data: undefined };
}

export async function uploadMenuItemImage(
  menuItemId: string,
  formData: FormData
): Promise<ActionResult<{ url: string }>> {
  const auth = await requireProfileRole(["admin", "restaurant_manager"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const parsedId = z.string().uuid().safeParse(menuItemId);
  if (!parsedId.success) {
    return { success: false, error: "Invalid menu item" };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { success: false, error: "Choose an image file." };
  }

  const fileError = validateMenuImageFile(file);
  if (fileError) return { success: false, error: fileError };

  const supabase = await createClient();
  const { data: item, error: fetchError } = await supabase
    .from("menu_items")
    .select("id, restaurant_id, image_url")
    .eq("id", parsedId.data)
    .maybeSingle();

  if (fetchError) return { success: false, error: fetchError.message };
  if (!item) return { success: false, error: "Menu item not found" };

  const allowed = await assertRestaurantMenuAccess(
    item.restaurant_id,
    auth.profile.role,
    auth.profile.id
  );
  if (!allowed) return { success: false, error: "Unauthorized" };

  const path = menuImageObjectPath(item.restaurant_id, item.id, file.type);
  const { error: uploadError } = await supabase.storage
    .from(MENU_IMAGES_BUCKET)
    .upload(path, file, {
      cacheControl: "31536000",
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    const hint = uploadError.message.includes("Bucket not found")
      ? " Run migration supabase/migrations/011_menu_item_image_storage.sql in Supabase."
      : "";
    return { success: false, error: `${uploadError.message}${hint}` };
  }

  const { data: publicData } = supabase.storage.from(MENU_IMAGES_BUCKET).getPublicUrl(path);
  const url = publicData.publicUrl;

  const { error: updateError } = await supabase
    .from("menu_items")
    .update({ image_url: url })
    .eq("id", item.id);

  if (updateError) {
    await supabase.storage.from(MENU_IMAGES_BUCKET).remove([path]);
    return { success: false, error: updateError.message };
  }

  await removeStoredMenuImage(supabase, item.image_url);

  await logAudit("upload_menu_item_image", "menu_item", item.id);
  revalidateMenuPaths();
  return { success: true, data: { url } };
}

export async function removeMenuItemImage(menuItemId: string): Promise<ActionResult> {
  const auth = await requireProfileRole(["admin", "restaurant_manager"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const parsedId = z.string().uuid().safeParse(menuItemId);
  if (!parsedId.success) {
    return { success: false, error: "Invalid menu item" };
  }

  const restaurantId = await getMenuItemRestaurantId(parsedId.data);
  if (!restaurantId) return { success: false, error: "Menu item not found" };

  const allowed = await assertRestaurantMenuAccess(
    restaurantId,
    auth.profile.role,
    auth.profile.id
  );
  if (!allowed) return { success: false, error: "Unauthorized" };

  const supabase = await createClient();
  const { data: item } = await supabase
    .from("menu_items")
    .select("image_url")
    .eq("id", parsedId.data)
    .maybeSingle();

  const { error } = await supabase
    .from("menu_items")
    .update({ image_url: null })
    .eq("id", parsedId.data);

  if (error) return { success: false, error: error.message };

  await removeStoredMenuImage(supabase, item?.image_url);

  await logAudit("remove_menu_item_image", "menu_item", parsedId.data);
  revalidateMenuPaths();
  return { success: true, data: undefined };
}
