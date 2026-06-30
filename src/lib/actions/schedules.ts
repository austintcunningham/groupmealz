"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
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
  status: z
    .enum(["draft", "open", "closed", "sent_to_restaurant", "delivered", "cancelled"])
    .optional(),
});

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
  const { data, error } = await supabase
    .from("daily_lunch_schedules")
    .insert({
      ...parsed.data,
      status: parsed.data.status ?? "draft",
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  await logAudit("create_schedule", "daily_lunch_schedule", data.id);
  revalidatePath("/admin/schedules");
  return { success: true, data: { id: data.id } };
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

  await logAudit("update_schedule_status", "daily_lunch_schedule", scheduleId, {
    status,
  });
  revalidatePath("/admin/schedules");
  revalidatePath("/app/today");
  revalidatePath("/restaurant/production");
  return { success: true, data: undefined };
}

export async function openLunchSchedule(scheduleId: string): Promise<ActionResult> {
  return updateScheduleStatus(scheduleId, "open");
}

export async function closeLunchSchedule(scheduleId: string): Promise<ActionResult> {
  return updateScheduleStatus(scheduleId, "closed");
}
