"use server";

import { revalidatePath } from "next/cache";
import { runWeeklyDigest } from "@/lib/email/weekly-digest";
import { requireProfileRole, type ActionResult } from "@/lib/actions/utils";

export async function sendWeeklyDigestNow(): Promise<
  ActionResult<{
    periodLabel: string;
    restaurantsSent: number;
    officesSent: number;
    opsSent: boolean;
    errors: string[];
  }>
> {
  const auth = await requireProfileRole(["admin"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const result = await runWeeklyDigest({ force: true });

  return {
    success: true,
    data: {
      periodLabel: result.period.label,
      restaurantsSent: result.restaurantsSent,
      officesSent: result.officesSent,
      opsSent: result.opsSent,
      errors: result.errors,
    },
  };
}
