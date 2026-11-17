import { createAdminClient } from "@/lib/supabase/admin";
import {
  DEMO_CATERING_SLUG,
  buildDemoCateringMenu,
  overlayDemoCateringRestaurant,
} from "@/lib/catering/demo-catalog";
import type { MenuCategory, MenuItem, Restaurant } from "@/types/database";

export type CateringRestaurant = Restaurant;

function missingCateringSchema(message: string | undefined): boolean {
  return Boolean(
    message &&
      (message.includes("supports_catering") ||
        message.includes("available_for_catering") ||
        message.includes("catering_only") ||
        message.includes("does not exist"))
  );
}

async function loadBaseRestaurantBySlug(slug: string): Promise<Restaurant | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();
  if (error) {
    console.error("loadBaseRestaurantBySlug", error.message);
    return null;
  }
  return (data as Restaurant | null) ?? null;
}

export async function listCateringRestaurants(): Promise<CateringRestaurant[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("active", true)
    .eq("supports_catering", true)
    .order("name");

  if (!error) {
    return (data ?? []) as CateringRestaurant[];
  }

  if (!missingCateringSchema(error.message)) {
    console.error("listCateringRestaurants", error.message);
    return [];
  }

  // Schema not migrated yet — surface authorized demo partner only.
  const base = await loadBaseRestaurantBySlug(DEMO_CATERING_SLUG);
  return base ? [overlayDemoCateringRestaurant(base)] : [];
}

export async function getCateringRestaurantBySlug(
  slug: string
): Promise<CateringRestaurant | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .eq("supports_catering", true)
    .maybeSingle();

  if (!error) {
    return (data as CateringRestaurant | null) ?? null;
  }

  if (!missingCateringSchema(error.message)) {
    console.error("getCateringRestaurantBySlug", error.message);
    return null;
  }

  if (slug !== DEMO_CATERING_SLUG) return null;
  const base = await loadBaseRestaurantBySlug(slug);
  return base ? overlayDemoCateringRestaurant(base) : null;
}

export async function loadCateringMenu(restaurantId: string): Promise<{
  categories: MenuCategory[];
  items: MenuItem[];
}> {
  const supabase = createAdminClient();
  const [{ data: categories, error: catErr }, { data: items, error: itemErr }] =
    await Promise.all([
      supabase
        .from("menu_categories")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .eq("active", true)
        .order("display_order"),
      supabase
        .from("menu_items")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .eq("active", true)
        .eq("available_for_catering", true)
        .order("display_order"),
    ]);

  if (itemErr && missingCateringSchema(itemErr.message)) {
    return buildDemoCateringMenu(restaurantId);
  }

  if (catErr && !missingCateringSchema(catErr.message)) {
    console.error("loadCateringMenu categories", catErr.message);
  }
  if (itemErr) {
    console.error("loadCateringMenu items", itemErr.message);
    return { categories: [], items: [] };
  }

  const cateringItems = (items ?? []) as MenuItem[];
  if (!cateringItems.length) {
    // DB migrated but catalog not seeded — still show demo for fhs-g UX.
    const { data: rest } = await supabase
      .from("restaurants")
      .select("slug")
      .eq("id", restaurantId)
      .maybeSingle();
    if (rest?.slug === DEMO_CATERING_SLUG) {
      return buildDemoCateringMenu(restaurantId);
    }
  }

  const neededCategoryIds = new Set(
    cateringItems.map((i) => i.category_id).filter(Boolean) as string[]
  );
  const cats = ((categories ?? []) as MenuCategory[]).filter(
    (c) => c.catering_only || neededCategoryIds.has(c.id)
  );

  return { categories: cats, items: cateringItems };
}

export function formatLeadTime(hours: number): string {
  if (hours < 24) return `${hours} hr lead time`;
  const days = Math.round(hours / 24);
  return days === 1 ? "1 day lead time" : `${days} day lead time`;
}

export function restaurantAddressLine(
  r: Pick<Restaurant, "street_address" | "city" | "state" | "zip">
) {
  return [r.street_address, [r.city, r.state].filter(Boolean).join(", "), r.zip]
    .filter(Boolean)
    .join(" · ");
}
