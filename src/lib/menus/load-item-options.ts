import type { SupabaseClient } from "@supabase/supabase-js";
import {
  groupIngredientsByMenuItem,
  groupSizesByMenuItem,
} from "@/lib/menus/item-options";
import type { MenuItemIngredient, MenuItemSize } from "@/types/database";

export async function loadMenuItemOptionsForItemIds(
  supabase: SupabaseClient,
  itemIds: string[]
): Promise<{
  sizes: MenuItemSize[];
  ingredients: MenuItemIngredient[];
  sizesByMenuItemId: Record<string, MenuItemSize[]>;
  ingredientsByMenuItemId: Record<string, MenuItemIngredient[]>;
}> {
  if (!itemIds.length) {
    return {
      sizes: [],
      ingredients: [],
      sizesByMenuItemId: {},
      ingredientsByMenuItemId: {},
    };
  }

  const [{ data: sizes }, { data: ingredients }] = await Promise.all([
    supabase
      .from("menu_item_sizes")
      .select("*")
      .in("menu_item_id", itemIds)
      .order("display_order"),
    supabase
      .from("menu_item_ingredients")
      .select("*")
      .in("menu_item_id", itemIds)
      .order("display_order"),
  ]);

  const sizeRows = (sizes ?? []) as MenuItemSize[];
  const ingredientRows = (ingredients ?? []) as MenuItemIngredient[];

  return {
    sizes: sizeRows,
    ingredients: ingredientRows,
    sizesByMenuItemId: groupSizesByMenuItem(sizeRows),
    ingredientsByMenuItemId: groupIngredientsByMenuItem(ingredientRows),
  };
}

export async function loadMenuItemOptionsForRestaurant(
  supabase: SupabaseClient,
  restaurantId: string
) {
  const { data: items } = await supabase
    .from("menu_items")
    .select("id")
    .eq("restaurant_id", restaurantId);

  return loadMenuItemOptionsForItemIds(
    supabase,
    (items ?? []).map((i) => i.id)
  );
}
