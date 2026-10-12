import { createAdminClient } from "@/lib/supabase/admin";
import { loadMenuItemOptionsForRestaurant } from "@/lib/menus/load-item-options";
import { isOrderingWindowOpen } from "@/lib/scheduling/window";
import type {
  DailyLunchSchedule,
  MenuCategory,
  MenuItem,
  MenuItemIngredient,
  MenuItemSize,
  Office,
  PlatformFeeType,
  Restaurant,
} from "@/types/database";
import type { ScheduleWithRelations } from "@/lib/order/office-order-page";

function weekDates(from: Date, days = 7): string[] {
  const out: string[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(from);
    d.setDate(from.getDate() + i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

function syntheticSchedule(
  office: Office,
  restaurant: Restaurant,
  lunchDate: string
): ScheduleWithRelations {
  const lunchNoon = new Date(`${lunchDate}T12:00:00`);
  const orderOpens = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const orderCutoff = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const delivery = new Date(lunchNoon);
  delivery.setHours(11, 30, 0, 0);

  const base: DailyLunchSchedule = {
    id: "00000000-0000-4000-8000-000000000001",
    office_id: office.id,
    restaurant_id: restaurant.id,
    lunch_date: lunchDate,
    order_opens_at: orderOpens.toISOString(),
    order_cutoff_at: orderCutoff.toISOString(),
    delivery_at: delivery.toISOString(),
    status: "open",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return { ...base, restaurants: restaurant, offices: office };
}

export type RestaurantOrderSimulation = {
  office: Office;
  schedule: ScheduleWithRelations;
  weekDays: {
    lunchDate: string;
    label: string;
    schedule: ScheduleWithRelations | null;
    orderable: boolean;
  }[];
  categories: MenuCategory[];
  menuItems: MenuItem[];
  sizesByMenuItemId: Record<string, MenuItemSize[]>;
  ingredientsByMenuItemId: Record<string, MenuItemIngredient[]>;
  advanceOrderHours: number;
  feeSettings: {
    platform_fee_type: PlatformFeeType;
    flat_fee_cents: number;
    percentage_bps: number;
    sales_tax_bps: number;
  };
};

export async function buildRestaurantOrderSimulation(
  restaurantSlug: string,
  options?: { officeSlug?: string; lunchDate?: string }
): Promise<RestaurantOrderSimulation | null> {
  const supabase = createAdminClient();

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("*")
    .eq("slug", restaurantSlug)
    .maybeSingle();
  if (!restaurant) return null;

  let office: Office | null = null;
  if (options?.officeSlug) {
    const { data } = await supabase
      .from("offices")
      .select("*")
      .eq("slug", options.officeSlug)
      .eq("active", true)
      .maybeSingle();
    office = data as Office | null;
  }
  if (!office) {
    const { data } = await supabase
      .from("offices")
      .select("*")
      .eq("active", true)
      .order("name")
      .limit(1)
      .maybeSingle();
    office = data as Office | null;
  }
  if (!office) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dates = weekDates(today, 7);
  const lunchDate =
    options?.lunchDate && dates.includes(options.lunchDate) ? options.lunchDate : dates[0];

  const schedule = syntheticSchedule(office, restaurant as Restaurant, lunchDate);

  const weekDays = dates.map((d) => {
    const daySchedule = d === lunchDate ? schedule : null;
    return {
      lunchDate: d,
      label: new Date(d + "T12:00:00").toLocaleDateString(undefined, {
        weekday: "short",
        month: "numeric",
        day: "numeric",
      }),
      schedule: daySchedule,
      orderable: daySchedule ? isOrderingWindowOpen(daySchedule) : false,
    };
  });

  const [{ data: categories }, { data: menuItems }, menuOptions, { data: settings }] =
    await Promise.all([
      supabase
        .from("menu_categories")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .eq("active", true)
        .order("display_order"),
      supabase
        .from("menu_items")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .eq("active", true)
        .eq("available", true)
        .order("display_order"),
      loadMenuItemOptionsForRestaurant(supabase, restaurant.id),
      supabase
        .from("platform_settings")
        .select("advance_order_hours, platform_fee_type, flat_fee_cents, percentage_bps, sales_tax_bps")
        .limit(1)
        .maybeSingle(),
    ]);

  return {
    office,
    schedule,
    weekDays,
    categories: categories ?? [],
    menuItems: menuItems ?? [],
    sizesByMenuItemId: menuOptions.sizesByMenuItemId,
    ingredientsByMenuItemId: menuOptions.ingredientsByMenuItemId,
    advanceOrderHours: settings?.advance_order_hours ?? 48,
    feeSettings: {
      platform_fee_type: settings?.platform_fee_type ?? "per_entree",
      flat_fee_cents: settings?.flat_fee_cents ?? 250,
      percentage_bps: settings?.percentage_bps ?? 0,
      sales_tax_bps: settings?.sales_tax_bps ?? 0,
    },
  };
}
