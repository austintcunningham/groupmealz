"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { sendFulfillmentDigestsForSchedule } from "@/lib/email/fulfillment-daily";
import {
  chicagoWallClockToDate,
  DEFAULT_CUTOFF_TIME,
  DEFAULT_DELIVERY_TIME,
  getChicagoDateString,
  getChicagoDayOfWeek,
} from "@/lib/scheduling/chicago";
import { computeOrderOpensAt, getAdvanceOrderHours } from "@/lib/scheduling/window";
import { createClient } from "@/lib/supabase/server";
import {
  logAudit,
  requireProfileRole,
  type ActionResult,
} from "@/lib/actions/utils";
import type { ScheduleStatus } from "@/types/database";

const scheduleSchema = z.object({
  office_id: z.string().uuid(),
  restaurant_id: z.string().uuid(),
  lunch_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  order_cutoff_at: z.string().datetime(),
  delivery_at: z.string().datetime(),
  order_opens_at: z.string().datetime().optional(),
  status: z
    .enum(["draft", "open", "closed", "sent_to_restaurant", "delivered", "cancelled"])
    .optional(),
});

const weeklyTemplateSchema = z.object({
  office_id: z.string().uuid(),
  day_of_week: z.number().int().min(0).max(6),
  restaurant_id: z.string().uuid(),
  cutoff_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  delivery_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  active: z.boolean().optional(),
});

/** Admin form: times are Central wall clock on lunch_date. */
export async function createLunchScheduleCentral(input: {
  office_id: string;
  restaurant_id: string;
  lunch_date: string;
  cutoff_time: string;
  delivery_time: string;
  status?: z.infer<typeof scheduleSchema>["status"];
}): Promise<ActionResult<{ id: string }>> {
  const cutoffAt = chicagoWallClockToDate(input.lunch_date, input.cutoff_time);
  const deliveryAt = chicagoWallClockToDate(input.lunch_date, input.delivery_time);
  return createLunchSchedule({
    office_id: input.office_id,
    restaurant_id: input.restaurant_id,
    lunch_date: input.lunch_date,
    order_cutoff_at: cutoffAt.toISOString(),
    delivery_at: deliveryAt.toISOString(),
    status: input.status,
  });
}

export async function createLunchSchedule(
  input: z.infer<typeof scheduleSchema>
): Promise<ActionResult<{ id: string }>> {
  const auth = await requireProfileRole(["admin"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const parsed = scheduleSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { data: settings } = await supabase.from("platform_settings").select("*").limit(1).single();
  const advanceHours = await getAdvanceOrderHours(settings);

  const cutoffAt = new Date(parsed.data.order_cutoff_at);
  const orderOpensAt =
    parsed.data.order_opens_at ??
    computeOrderOpensAt(parsed.data.lunch_date, cutoffAt, advanceHours).toISOString();

  const { data, error } = await supabase
    .from("daily_lunch_schedules")
    .insert({
      ...parsed.data,
      order_opens_at: orderOpensAt,
      status: parsed.data.status ?? "draft",
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  await logAudit("create_schedule", "daily_lunch_schedule", data.id);
  revalidatePath("/admin/schedules");
  return { success: true, data: { id: data.id } };
}

export async function createWeeklyTemplate(
  input: z.infer<typeof weeklyTemplateSchema>
): Promise<ActionResult<{ id: string }>> {
  const auth = await requireProfileRole(["admin"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const parsed = weeklyTemplateSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("weekly_schedule_templates")
    .upsert(parsed.data, { onConflict: "office_id,day_of_week" })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/schedules");
  return { success: true, data: { id: data.id } };
}

/** Generate daily schedules from weekly templates for the next N days */
export async function generateSchedulesFromTemplates(
  daysAhead = 14
): Promise<ActionResult<{ created: number }>> {
  const auth = await requireProfileRole(["admin"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const supabase = await createClient();
  const { data: templates } = await supabase
    .from("weekly_schedule_templates")
    .select("*")
    .eq("active", true);

  if (!templates?.length) return { success: false, error: "No weekly templates configured" };

  const { data: settings } = await supabase.from("platform_settings").select("*").limit(1).single();
  const advanceHours = await getAdvanceOrderHours(settings);

  let created = 0;
  const startChicago = getChicagoDateString();

  for (let d = 0; d < daysAhead; d++) {
    const base = chicagoWallClockToDate(startChicago, "12:00:00");
    base.setUTCDate(base.getUTCDate() + d);
    const lunchDate = getChicagoDateString(base);
    const dow = getChicagoDayOfWeek(lunchDate);

    for (const tmpl of templates.filter((t) => t.day_of_week === dow)) {
      const cutoffAt = chicagoWallClockToDate(lunchDate, tmpl.cutoff_time);
      const deliveryAt = chicagoWallClockToDate(lunchDate, tmpl.delivery_time);
      const orderOpensAt = computeOrderOpensAt(lunchDate, cutoffAt, advanceHours);

      const { error } = await supabase.from("daily_lunch_schedules").upsert(
        {
          office_id: tmpl.office_id,
          restaurant_id: tmpl.restaurant_id,
          lunch_date: lunchDate,
          order_cutoff_at: cutoffAt.toISOString(),
          delivery_at: deliveryAt.toISOString(),
          order_opens_at: orderOpensAt.toISOString(),
          status: orderOpensAt <= new Date() && cutoffAt > new Date() ? "open" : "draft",
        },
        { onConflict: "office_id,lunch_date", ignoreDuplicates: false }
      );

      if (!error) created++;
    }
  }

  revalidatePath("/admin/schedules");
  revalidatePath("/app/week");
  return { success: true, data: { created } };
}

async function emailRestaurantForSchedule(scheduleId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const result = await sendFulfillmentDigestsForSchedule(scheduleId, { force: true });

  if (!result.restaurantSent && !result.officeSent) {
    return {
      success: false,
      error: result.errors.join("; ") || "No fulfillment emails sent",
    };
  }

  await supabase
    .from("daily_lunch_schedules")
    .update({ status: "sent_to_restaurant" })
    .eq("id", scheduleId);

  return { success: true, data: undefined };
}

export async function updateScheduleStatus(
  scheduleId: string,
  status: ScheduleStatus
): Promise<ActionResult> {
  const auth = await requireProfileRole(["admin"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("daily_lunch_schedules")
    .update({ status })
    .eq("id", scheduleId);

  if (error) return { success: false, error: error.message };

  await logAudit("update_schedule_status", "daily_lunch_schedule", scheduleId, { status });
  revalidatePath("/admin/schedules");
  revalidatePath("/app/order");
  revalidatePath("/app/week");
  revalidatePath("/restaurant/production");
  return { success: true, data: undefined };
}

/** Set or update restaurant for a single calendar day */
export async function upsertDaySchedule(input: {
  officeId: string;
  lunchDate: string;
  restaurantId: string;
  cutoffTime?: string;
  deliveryTime?: string;
}): Promise<ActionResult<{ id: string }>> {
  const auth = await requireProfileRole(["admin"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const supabase = await createClient();
  const { data: settings } = await supabase.from("platform_settings").select("*").limit(1).single();
  const advanceHours = await getAdvanceOrderHours(settings);

  const cutoffTime = input.cutoffTime ?? DEFAULT_CUTOFF_TIME;
  const deliveryTime = input.deliveryTime ?? DEFAULT_DELIVERY_TIME;
  const cutoffAt = chicagoWallClockToDate(input.lunchDate, cutoffTime);
  const deliveryAt = chicagoWallClockToDate(input.lunchDate, deliveryTime);
  const orderOpensAt = computeOrderOpensAt(input.lunchDate, cutoffAt, advanceHours);

  const { data, error } = await supabase
    .from("daily_lunch_schedules")
    .upsert(
      {
        office_id: input.officeId,
        restaurant_id: input.restaurantId,
        lunch_date: input.lunchDate,
        order_cutoff_at: cutoffAt.toISOString(),
        delivery_at: deliveryAt.toISOString(),
        order_opens_at: orderOpensAt.toISOString(),
        status: "draft",
      },
      { onConflict: "office_id,lunch_date" }
    )
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/schedules");
  revalidatePath("/order");
  return { success: true, data: { id: data.id } };
}

export async function openLunchSchedule(scheduleId: string): Promise<ActionResult> {
  return updateScheduleStatus(scheduleId, "open");
}

export async function closeLunchSchedule(scheduleId: string): Promise<ActionResult> {
  return updateScheduleStatus(scheduleId, "closed");
}

export async function sendScheduleToRestaurant(scheduleId: string): Promise<ActionResult> {
  const auth = await requireProfileRole(["admin"]);
  if ("error" in auth) return { success: false, error: auth.error };
  return emailRestaurantForSchedule(scheduleId);
}
