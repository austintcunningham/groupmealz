"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requireProfileRole, type ActionResult } from "@/lib/actions/utils";
import { normalizeStaffEmail, upsertStaffInvitation } from "@/lib/staff/invitations";

/** Applies any pending staff_invitations for the signed-in user (signup hook + login safety net). */
export async function applyPendingStaffInvitationsForCurrentUser(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return;

  try {
    const admin = createAdminClient();
    await admin.rpc("apply_staff_invitations_for_user", {
      p_user_id: user.id,
      p_email: normalizeStaffEmail(user.email),
    });
  } catch {
    // Migration 006 not applied yet, or missing service role — ignore.
  }
}

export async function findProfileIdByEmail(
  email: string
): Promise<ActionResult<{ id: string; full_name: string; email: string }>> {
  const auth = await requireProfileRole(["admin"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const normalized = normalizeStaffEmail(email);
  if (!normalized) {
    return { success: false, error: "Email is required" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .ilike("email", normalized)
    .maybeSingle();

  if (error) return { success: false, error: error.message };
  if (!data) {
    return {
      success: false,
      error: "No account yet — use Assign / Invite below to pre-assign their role by email.",
    };
  }

  return { success: true, data };
}

export async function invitePlatformAdminByEmail(
  email: string
): Promise<ActionResult<{ status: "assigned" | "invited"; email: string }>> {
  const auth = await requireProfileRole(["admin"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const normalized = normalizeStaffEmail(email);
  if (!normalized) {
    return { success: false, error: "Email is required." };
  }

  if (normalized === auth.profile.email.trim().toLowerCase()) {
    return { success: false, error: "You are already a platform admin." };
  }

  const result = await upsertStaffInvitation({
    kind: "platform_admin",
    email: normalized,
    createdBy: auth.profile.id,
  });

  if ("error" in result) {
    return { success: false, error: result.error };
  }

  revalidatePath("/admin/settings");
  return { success: true, data: { status: result.status, email: result.email } };
}
