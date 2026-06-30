"use server";

import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function getAuthenticatedProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return data as Profile | null;
}

export async function requireProfileRole(
  roles: Profile["role"][]
): Promise<{ profile: Profile } | { error: string }> {
  const profile = await getAuthenticatedProfile();
  if (!profile) {
    return { error: "Not authenticated" };
  }
  if (!roles.includes(profile.role)) {
    return { error: "Unauthorized" };
  }
  return { profile };
}

export async function logAudit(
  action: string,
  entityType?: string,
  entityId?: string,
  metadata?: Record<string, unknown>
) {
  const supabase = await createClient();
  const profile = await getAuthenticatedProfile();

  await supabase.from("audit_log").insert({
    actor_user_id: profile?.id ?? null,
    action,
    entity_type: entityType ?? null,
    entity_id: entityId ?? null,
    metadata: metadata ?? null,
  });
}
