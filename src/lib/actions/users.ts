"use server";

import { createClient } from "@/lib/supabase/server";
import { requireProfileRole, type ActionResult } from "@/lib/actions/utils";

export async function findProfileIdByEmail(
  email: string
): Promise<ActionResult<{ id: string; full_name: string; email: string }>> {
  const auth = await requireProfileRole(["admin"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const normalized = email.trim().toLowerCase();
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
      error: "No user found with that email. They must sign up first.",
    };
  }

  return { success: true, data };
}
