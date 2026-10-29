"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  logAudit,
  requireProfileRole,
  type ActionResult,
} from "@/lib/actions/utils";
import type { RestaurantNotice } from "@/types/database";

const MAX_NOTICES = 8;

const messageSchema = z
  .string()
  .trim()
  .min(1, "Enter a short notice")
  .max(120, "Keep notices to 120 characters");

async function assertRestaurantNoticeAccess(
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

function revalidateNoticePaths() {
  revalidatePath("/restaurant/notices");
  revalidatePath("/restaurant");
  revalidatePath("/order");
}

export async function listRestaurantNotices(
  restaurantId: string
): Promise<ActionResult<RestaurantNotice[]>> {
  const auth = await requireProfileRole(["admin", "restaurant_manager"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const allowed = await assertRestaurantNoticeAccess(
    restaurantId,
    auth.profile.role,
    auth.profile.id
  );
  if (!allowed) return { success: false, error: "Unauthorized" };

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("restaurant_notices")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data: (data ?? []) as RestaurantNotice[] };
}

export async function addRestaurantNotice(
  restaurantId: string,
  message: string
): Promise<ActionResult<{ id: string }>> {
  const auth = await requireProfileRole(["admin", "restaurant_manager"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const allowed = await assertRestaurantNoticeAccess(
    restaurantId,
    auth.profile.role,
    auth.profile.id
  );
  if (!allowed) return { success: false, error: "Unauthorized" };

  const parsed = messageSchema.safeParse(message);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid notice" };
  }

  const admin = createAdminClient();
  const { count } = await admin
    .from("restaurant_notices")
    .select("id", { count: "exact", head: true })
    .eq("restaurant_id", restaurantId);

  if ((count ?? 0) >= MAX_NOTICES) {
    return {
      success: false,
      error: `You can post up to ${MAX_NOTICES} notices. Remove one to add another.`,
    };
  }

  const { data, error } = await admin
    .from("restaurant_notices")
    .insert({
      restaurant_id: restaurantId,
      message: parsed.data,
      created_by: auth.profile.id,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  await logAudit("restaurant_notice_add", "restaurant_notice", data.id, {
    restaurantId,
    message: parsed.data,
  });
  revalidateNoticePaths();
  return { success: true, data: { id: data.id } };
}

export async function removeRestaurantNotice(
  noticeId: string
): Promise<ActionResult> {
  const auth = await requireProfileRole(["admin", "restaurant_manager"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("restaurant_notices")
    .select("id, restaurant_id, message")
    .eq("id", noticeId)
    .maybeSingle();

  if (!existing) return { success: false, error: "Notice not found" };

  const allowed = await assertRestaurantNoticeAccess(
    existing.restaurant_id,
    auth.profile.role,
    auth.profile.id
  );
  if (!allowed) return { success: false, error: "Unauthorized" };

  const { error } = await admin.from("restaurant_notices").delete().eq("id", noticeId);
  if (error) return { success: false, error: error.message };

  await logAudit("restaurant_notice_remove", "restaurant_notice", noticeId, {
    restaurantId: existing.restaurant_id,
    message: existing.message,
  });
  revalidateNoticePaths();
  return { success: true, data: undefined };
}

export async function clearRestaurantNotices(
  restaurantId: string
): Promise<ActionResult> {
  const auth = await requireProfileRole(["admin", "restaurant_manager"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const allowed = await assertRestaurantNoticeAccess(
    restaurantId,
    auth.profile.role,
    auth.profile.id
  );
  if (!allowed) return { success: false, error: "Unauthorized" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("restaurant_notices")
    .delete()
    .eq("restaurant_id", restaurantId);

  if (error) return { success: false, error: error.message };

  await logAudit("restaurant_notice_clear", "restaurant", restaurantId);
  revalidateNoticePaths();
  return { success: true, data: undefined };
}
