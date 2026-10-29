"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  logAudit,
  requireProfileRole,
  type ActionResult,
} from "@/lib/actions/utils";
import { moveIdInList, sortMenuCategories, sortMenuItems } from "@/lib/menus/sort";
import {
  MENU_IMAGES_BUCKET,
  menuImageObjectPath,
  menuImagePathFromPublicUrl,
  validateMenuImageFile,
} from "@/lib/storage/menu-images";

const categorySchema = z.object({
  restaurant_id: z.string().uuid(),
  name: z.string().min(1),
  parent_id: z.string().uuid().nullable().optional(),
  display_order: z.number().int().optional(),
  active: z.boolean().optional(),
});

const updateMenuCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  parent_id: z.string().uuid().nullable().optional(),
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

async function validateCategoryParent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  restaurantId: string,
  parentId: string | null | undefined,
  categoryId?: string
): Promise<string | null> {
  if (parentId === undefined) return null;
  if (parentId === null) return null;
  if (categoryId && parentId === categoryId) {
    return "A category cannot be its own parent.";
  }
  const { data: parent, error } = await supabase
    .from("menu_categories")
    .select("id, restaurant_id, parent_id")
    .eq("id", parentId)
    .maybeSingle();
  if (error) return error.message;
  if (!parent || parent.restaurant_id !== restaurantId) {
    return "Parent category not found.";
  }
  if (parent.parent_id) {
    return "Sub-categories can only go one level deep — pick a top-level category.";
  }
  return null;
}

async function nextCategoryDisplayOrder(
  supabase: Awaited<ReturnType<typeof createClient>>,
  restaurantId: string,
  parentId: string | null = null
): Promise<number> {
  let query = supabase
    .from("menu_categories")
    .select("display_order")
    .eq("restaurant_id", restaurantId)
    .order("display_order", { ascending: false })
    .limit(1);

  if (parentId) {
    query = query.eq("parent_id", parentId);
  } else {
    query = query.is("parent_id", null);
  }

  const { data } = await query.maybeSingle();
  return (data?.display_order ?? -1) + 1;
}

async function nextMenuItemDisplayOrder(
  supabase: Awaited<ReturnType<typeof createClient>>,
  restaurantId: string,
  categoryId: string | null
): Promise<number> {
  let query = supabase
    .from("menu_items")
    .select("display_order")
    .eq("restaurant_id", restaurantId)
    .order("display_order", { ascending: false })
    .limit(1);

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  } else {
    query = query.is("category_id", null);
  }

  const { data } = await query.maybeSingle();
  return (data?.display_order ?? -1) + 1;
}

async function applyCategoryDisplayOrder(
  supabase: Awaited<ReturnType<typeof createClient>>,
  orderedIds: string[]
): Promise<string | null> {
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase
      .from("menu_categories")
      .update({ display_order: i })
      .eq("id", orderedIds[i]);
    if (error) return error.message;
  }
  return null;
}

async function applyMenuItemDisplayOrder(
  supabase: Awaited<ReturnType<typeof createClient>>,
  orderedIds: string[]
): Promise<string | null> {
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase
      .from("menu_items")
      .update({ display_order: i })
      .eq("id", orderedIds[i]);
    if (error) return error.message;
  }
  return null;
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
  const parentId = parsed.data.parent_id ?? null;
  const parentError = await validateCategoryParent(
    supabase,
    parsed.data.restaurant_id,
    parentId
  );
  if (parentError) return { success: false, error: parentError };

  const display_order =
    parsed.data.display_order ??
    (await nextCategoryDisplayOrder(supabase, parsed.data.restaurant_id, parentId));

  const { data, error } = await supabase
    .from("menu_categories")
    .insert({ ...parsed.data, parent_id: parentId, display_order })
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

  if (patch.parent_id !== undefined) {
    const parentError = await validateCategoryParent(
      supabase,
      restaurantId,
      patch.parent_id,
      id
    );
    if (parentError) return { success: false, error: parentError };

    if (patch.parent_id) {
      const { count } = await supabase
        .from("menu_categories")
        .select("id", { count: "exact", head: true })
        .eq("parent_id", id);
      if ((count ?? 0) > 0) {
        return {
          success: false,
          error: "Move or delete sub-categories first — this category has sub-sections.",
        };
      }
    }
  }

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
  const categoryId = parsed.data.category_id ?? null;
  const display_order =
    parsed.data.display_order ??
    (await nextMenuItemDisplayOrder(supabase, parsed.data.restaurant_id, categoryId));

  const { data, error } = await supabase
    .from("menu_items")
    .insert({ ...parsed.data, display_order })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  await logAudit("create_menu_item", "menu_item", data.id);
  revalidateMenuPaths();
  return { success: true, data: { id: data.id } };
}

export async function moveMenuCategory(
  categoryId: string,
  direction: "up" | "down"
): Promise<ActionResult> {
  const auth = await requireProfileRole(["admin", "restaurant_manager"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const restaurantId = await getCategoryRestaurantId(categoryId);
  if (!restaurantId) return { success: false, error: "Category not found" };

  const allowed = await assertRestaurantMenuAccess(
    restaurantId,
    auth.profile.role,
    auth.profile.id
  );
  if (!allowed) return { success: false, error: "Unauthorized" };

  const supabase = await createClient();
  const { data: self, error: selfError } = await supabase
    .from("menu_categories")
    .select("id, parent_id")
    .eq("id", categoryId)
    .maybeSingle();

  if (selfError) return { success: false, error: selfError.message };
  if (!self) return { success: false, error: "Category not found" };

  let query = supabase
    .from("menu_categories")
    .select("id, display_order, name, parent_id")
    .eq("restaurant_id", restaurantId);

  if (self.parent_id) {
    query = query.eq("parent_id", self.parent_id);
  } else {
    query = query.is("parent_id", null);
  }

  const { data: rows, error: fetchError } = await query;

  if (fetchError) return { success: false, error: fetchError.message };

  const ordered = sortMenuCategories(rows as import("@/types/database").MenuCategory[]);
  const ids = ordered.map((c) => c.id);
  const nextIds = moveIdInList(ids, categoryId, direction);
  if (nextIds.join() === ids.join()) {
    return { success: true, data: undefined };
  }

  const applyError = await applyCategoryDisplayOrder(supabase, nextIds);
  if (applyError) return { success: false, error: applyError };

  revalidateMenuPaths();
  return { success: true, data: undefined };
}

export async function moveMenuItem(
  itemId: string,
  direction: "up" | "down"
): Promise<ActionResult> {
  const auth = await requireProfileRole(["admin", "restaurant_manager"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const supabase = await createClient();
  const { data: item, error: itemError } = await supabase
    .from("menu_items")
    .select("id, restaurant_id, category_id")
    .eq("id", itemId)
    .maybeSingle();

  if (itemError) return { success: false, error: itemError.message };
  if (!item) return { success: false, error: "Menu item not found" };

  const allowed = await assertRestaurantMenuAccess(
    item.restaurant_id,
    auth.profile.role,
    auth.profile.id
  );
  if (!allowed) return { success: false, error: "Unauthorized" };

  let query = supabase
    .from("menu_items")
    .select("id, display_order, name, category_id")
    .eq("restaurant_id", item.restaurant_id);

  if (item.category_id) {
    query = query.eq("category_id", item.category_id);
  } else {
    query = query.is("category_id", null);
  }

  const { data: rows, error: fetchError } = await query;
  if (fetchError) return { success: false, error: fetchError.message };

  const ordered = sortMenuItems(rows as import("@/types/database").MenuItem[]);
  const ids = ordered.map((i) => i.id);
  const nextIds = moveIdInList(ids, itemId, direction);
  if (nextIds.join() === ids.join()) {
    return { success: true, data: undefined };
  }

  const applyError = await applyMenuItemDisplayOrder(supabase, nextIds);
  if (applyError) return { success: false, error: applyError };

  revalidateMenuPaths();
  return { success: true, data: undefined };
}

const reorderIdsSchema = z.array(z.string().uuid()).min(1);

async function assertCategorySiblingOrder(
  supabase: Awaited<ReturnType<typeof createClient>>,
  orderedIds: string[],
  profileRole: string,
  profileId: string
): Promise<{ error?: string }> {
  const { data: rows, error } = await supabase
    .from("menu_categories")
    .select("id, restaurant_id, parent_id")
    .in("id", orderedIds);

  if (error) return { error: error.message };
  if (!rows?.length || rows.length !== orderedIds.length) {
    return { error: "One or more categories were not found" };
  }

  const restaurantId = rows[0]!.restaurant_id;
  const parentId = rows[0]!.parent_id ?? null;
  if (
    !rows.every(
      (r) => r.restaurant_id === restaurantId && (r.parent_id ?? null) === parentId
    )
  ) {
    return { error: "Categories must belong to the same section" };
  }

  const allowed = await assertRestaurantMenuAccess(restaurantId, profileRole, profileId);
  if (!allowed) return { error: "Unauthorized" };

  let siblingQuery = supabase
    .from("menu_categories")
    .select("id")
    .eq("restaurant_id", restaurantId);
  siblingQuery = parentId
    ? siblingQuery.eq("parent_id", parentId)
    : siblingQuery.is("parent_id", null);

  const { data: siblings, error: sibErr } = await siblingQuery;
  if (sibErr) return { error: sibErr.message };

  const siblingIds = new Set((siblings ?? []).map((s) => s.id));
  if (
    orderedIds.length !== siblingIds.size ||
    !orderedIds.every((id) => siblingIds.has(id))
  ) {
    return { error: "Invalid category order for this section" };
  }

  return {};
}

/** Persist drag-and-drop order for categories (top-level or sub-categories). */
export async function reorderMenuCategories(orderedIds: string[]): Promise<ActionResult> {
  const auth = await requireProfileRole(["admin", "restaurant_manager"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const parsed = reorderIdsSchema.safeParse(orderedIds);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid order" };
  }

  const supabase = await createClient();
  const gate = await assertCategorySiblingOrder(
    supabase,
    parsed.data,
    auth.profile.role,
    auth.profile.id
  );
  if (gate.error) return { success: false, error: gate.error };

  const applyError = await applyCategoryDisplayOrder(supabase, parsed.data);
  if (applyError) return { success: false, error: applyError };

  revalidateMenuPaths();
  return { success: true, data: undefined };
}

async function assertMenuItemSiblingOrder(
  supabase: Awaited<ReturnType<typeof createClient>>,
  orderedIds: string[],
  profileRole: string,
  profileId: string
): Promise<{ error?: string }> {
  const { data: rows, error } = await supabase
    .from("menu_items")
    .select("id, restaurant_id, category_id")
    .in("id", orderedIds);

  if (error) return { error: error.message };
  if (!rows?.length || rows.length !== orderedIds.length) {
    return { error: "One or more menu items were not found" };
  }

  const restaurantId = rows[0]!.restaurant_id;
  const categoryId = rows[0]!.category_id ?? null;
  if (
    !rows.every(
      (r) => r.restaurant_id === restaurantId && (r.category_id ?? null) === categoryId
    )
  ) {
    return { error: "Items must belong to the same category" };
  }

  const allowed = await assertRestaurantMenuAccess(restaurantId, profileRole, profileId);
  if (!allowed) return { error: "Unauthorized" };

  let siblingQuery = supabase
    .from("menu_items")
    .select("id")
    .eq("restaurant_id", restaurantId);
  siblingQuery = categoryId
    ? siblingQuery.eq("category_id", categoryId)
    : siblingQuery.is("category_id", null);

  const { data: siblings, error: sibErr } = await siblingQuery;
  if (sibErr) return { error: sibErr.message };

  const siblingIds = new Set((siblings ?? []).map((s) => s.id));
  if (
    orderedIds.length !== siblingIds.size ||
    !orderedIds.every((id) => siblingIds.has(id))
  ) {
    return { error: "Invalid item order for this category" };
  }

  return {};
}

/** Persist drag-and-drop order for items within one category. */
export async function reorderMenuItems(orderedIds: string[]): Promise<ActionResult> {
  const auth = await requireProfileRole(["admin", "restaurant_manager"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const parsed = reorderIdsSchema.safeParse(orderedIds);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid order" };
  }

  const supabase = await createClient();
  const gate = await assertMenuItemSiblingOrder(
    supabase,
    parsed.data,
    auth.profile.role,
    auth.profile.id
  );
  if (gate.error) return { success: false, error: gate.error };

  const applyError = await applyMenuItemDisplayOrder(supabase, parsed.data);
  if (applyError) return { success: false, error: applyError };

  revalidateMenuPaths();
  return { success: true, data: undefined };
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

  const updatePayload: Record<string, unknown> = { ...patch };

  if (patch.category_id !== undefined) {
    const { data: current } = await supabase
      .from("menu_items")
      .select("category_id")
      .eq("id", id)
      .maybeSingle();
    if (current && current.category_id !== patch.category_id) {
      updatePayload.display_order = await nextMenuItemDisplayOrder(
        supabase,
        restaurantId,
        patch.category_id
      );
    }
  }

  const { error } = await supabase.from("menu_items").update(updatePayload).eq("id", id);

  if (error) return { success: false, error: error.message };

  await logAudit("update_menu_item", "menu_item", id);
  revalidateMenuPaths();
  return { success: true, data: undefined };
}

/** Hide or restore a menu item for customers without deleting it. */
export async function setMenuItemAvailable(
  itemId: string,
  available: boolean
): Promise<ActionResult> {
  return updateMenuItem({ id: itemId, available });
}

const menuItemSizeInputSchema = z.object({
  name: z.string().min(1).max(40),
  price_cents: z.number().int().min(0),
  is_default: z.boolean().optional(),
});

const menuItemIngredientInputSchema = z.object({
  name: z.string().min(1).max(60),
});

const syncMenuItemOptionsSchema = z.object({
  menuItemId: z.string().uuid(),
  sizes: z.array(menuItemSizeInputSchema),
  ingredients: z.array(menuItemIngredientInputSchema),
});

/** Replace size + ingredient rows for a menu item (manager/admin). */
export async function syncMenuItemOptions(
  input: z.infer<typeof syncMenuItemOptionsSchema>
): Promise<ActionResult> {
  const auth = await requireProfileRole(["admin", "restaurant_manager"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const parsed = syncMenuItemOptionsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid options" };
  }

  const restaurantId = await getMenuItemRestaurantId(parsed.data.menuItemId);
  if (!restaurantId) return { success: false, error: "Menu item not found" };

  const allowed = await assertRestaurantMenuAccess(
    restaurantId,
    auth.profile.role,
    auth.profile.id
  );
  if (!allowed) return { success: false, error: "Unauthorized" };

  const { menuItemId, sizes, ingredients } = parsed.data;

  if (sizes.length > 0) {
    const defaultCount = sizes.filter((s) => s.is_default).length;
    if (defaultCount !== 1) {
      return { success: false, error: "Choose exactly one default size when sizes are listed." };
    }
  }

  const supabase = await createClient();

  const { error: delSizesErr } = await supabase
    .from("menu_item_sizes")
    .delete()
    .eq("menu_item_id", menuItemId);
  if (delSizesErr) return { success: false, error: delSizesErr.message };

  const { error: delIngErr } = await supabase
    .from("menu_item_ingredients")
    .delete()
    .eq("menu_item_id", menuItemId);
  if (delIngErr) return { success: false, error: delIngErr.message };

  if (sizes.length) {
    const { error: insSizesErr } = await supabase.from("menu_item_sizes").insert(
      sizes.map((s, i) => ({
        menu_item_id: menuItemId,
        name: s.name.trim(),
        price_cents: s.price_cents,
        display_order: i,
        is_default: Boolean(s.is_default),
      }))
    );
    if (insSizesErr) return { success: false, error: insSizesErr.message };

    const defaultSize = sizes.find((s) => s.is_default) ?? sizes[0];
    if (defaultSize) {
      await supabase
        .from("menu_items")
        .update({ price_cents: defaultSize.price_cents })
        .eq("id", menuItemId);
    }
  }

  if (ingredients.length) {
    const { error: insIngErr } = await supabase.from("menu_item_ingredients").insert(
      ingredients.map((ing, i) => ({
        menu_item_id: menuItemId,
        name: ing.name.trim(),
        display_order: i,
      }))
    );
    if (insIngErr) return { success: false, error: insIngErr.message };
  }

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
