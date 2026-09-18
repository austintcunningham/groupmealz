import { createAdminClient } from "@/lib/supabase/admin";
import { isOrderingWindowOpen } from "@/lib/scheduling/window";
import type { DailyLunchSchedule, MenuCategory, MenuItem, Office, Restaurant } from "@/types/database";

export type ScheduleWithRelations = DailyLunchSchedule & {
  restaurants: Restaurant | null;
  offices: Office | null;
};

export async function getOfficeBySlug(slug: string): Promise<Office | null> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("offices").select("*").eq("slug", slug).eq("active", true).maybeSingle();
  return data as Office | null;
}

function weekDates(from: Date, days = 7): string[] {
  const out: string[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(from);
    d.setDate(from.getDate() + i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export async function loadOfficeOrderContext(office: Office, selectedDate: string) {
  const supabase = createAdminClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dates = weekDates(today, 7);

  const start = dates[0];
  const end = dates[dates.length - 1];

  const { data: schedules } = await supabase
    .from("daily_lunch_schedules")
    .select("*, restaurants(*), offices(*)")
    .eq("office_id", office.id)
    .gte("lunch_date", start)
    .lte("lunch_date", end)
    .order("lunch_date");

  const scheduleByDate = new Map(
    (schedules ?? []).map((s) => [s.lunch_date, s as ScheduleWithRelations])
  );

  const weekDays = dates.map((lunchDate) => {
    const d = new Date(lunchDate + "T12:00:00");
    const schedule = scheduleByDate.get(lunchDate) ?? null;
    return {
      lunchDate,
      label: d.toLocaleDateString(undefined, { weekday: "short", month: "numeric", day: "numeric" }),
      schedule,
      orderable: schedule ? isOrderingWindowOpen(schedule) : false,
    };
  });

  let schedule =
    scheduleByDate.get(selectedDate) ??
    weekDays.find((w) => w.orderable)?.schedule ??
    scheduleByDate.get(dates[0]) ??
    null;

  const { data: settings } = await supabase
    .from("platform_settings")
    .select("advance_order_hours, platform_fee_type, flat_fee_cents, percentage_bps, sales_tax_bps")
    .limit(1)
    .maybeSingle();

  const feeSettings = {
    platform_fee_type: settings?.platform_fee_type ?? "flat",
    flat_fee_cents: settings?.flat_fee_cents ?? 250,
    percentage_bps: settings?.percentage_bps ?? 0,
    sales_tax_bps: settings?.sales_tax_bps ?? 0,
  };

  if (!schedule) {
    return {
      weekDays,
      schedule: null,
      categories: [] as MenuCategory[],
      menuItems: [] as MenuItem[],
      advanceOrderHours: settings?.advance_order_hours ?? 48,
      feeSettings,
    };
  }

  const [{ data: categories }, { data: menuItems }] = await Promise.all([
    supabase
      .from("menu_categories")
      .select("*")
      .eq("restaurant_id", schedule.restaurant_id)
      .eq("active", true),
    supabase
      .from("menu_items")
      .select("*")
      .eq("restaurant_id", schedule.restaurant_id)
      .eq("active", true)
      .eq("available", true),
  ]);

  return {
    weekDays,
    schedule,
    categories: categories ?? [],
    menuItems: menuItems ?? [],
    advanceOrderHours: settings?.advance_order_hours ?? 48,
    feeSettings,
  };
}
