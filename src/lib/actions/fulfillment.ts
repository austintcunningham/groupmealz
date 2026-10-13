"use server";

import { revalidatePath } from "next/cache";
import {
  runDailyFulfillmentCron,
  sendFulfillmentDigestsForSchedule,
} from "@/lib/email/fulfillment-daily";
import { requireProfileRole, type ActionResult } from "@/lib/actions/utils";

export async function sendFulfillmentNowForSchedule(
  scheduleId: string
): Promise<ActionResult<{ restaurantSent: boolean; officeSent: number; errors: string[] }>> {
  const auth = await requireProfileRole(["admin"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const result = await sendFulfillmentDigestsForSchedule(scheduleId, { force: true });
  revalidatePath("/admin/schedules");

  if (result.errors.length && !result.restaurantSent && result.officeSent === 0) {
    return { success: false, error: result.errors.join("; ") };
  }

  return {
    success: true,
    data: {
      restaurantSent: result.restaurantSent,
      officeSent: result.officeSent,
      errors: result.errors,
    },
  };
}

export async function sendDailyFulfillmentNow(): Promise<
  ActionResult<{ schedulesProcessed: number; errors: string[] }>
> {
  const auth = await requireProfileRole(["admin"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const result = await runDailyFulfillmentCron(undefined, { force: true });
  revalidatePath("/admin/schedules");

  return {
    success: true,
    data: {
      schedulesProcessed: result.schedulesProcessed,
      errors: result.errors,
    },
  };
}
