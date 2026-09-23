import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/types/database";

export function normalizeStaffEmail(email: string): string {
  return email.trim().toLowerCase();
}

export type StaffInviteInput =
  | { kind: "platform_admin"; email: string; createdBy?: string }
  | {
      kind: "restaurant_manager";
      email: string;
      restaurantId: string;
      createdBy?: string;
    }
  | {
      kind: "office_member";
      email: string;
      officeId: string;
      officeRole: "office_admin" | "employee";
      createdBy?: string;
    };

async function findProfileIdByEmailAdmin(
  email: string
): Promise<{ id: string; full_name: string; email: string } | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("id, full_name, email")
    .ilike("email", email)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

function invitationRow(input: StaffInviteInput): Record<string, unknown> {
  const email = normalizeStaffEmail(
    input.kind === "platform_admin"
      ? input.email
      : input.kind === "restaurant_manager"
        ? input.email
        : input.email
  );
  const createdBy = input.createdBy ?? null;

  switch (input.kind) {
    case "platform_admin":
      return {
        email,
        profile_role: "admin",
        office_id: null,
        office_user_role: null,
        restaurant_id: null,
        created_by: createdBy,
      };
    case "restaurant_manager":
      return {
        email,
        profile_role: "restaurant_manager",
        restaurant_id: input.restaurantId,
        office_id: null,
        office_user_role: null,
        created_by: createdBy,
      };
    case "office_member":
      return {
        email,
        profile_role: input.officeRole,
        office_id: input.officeId,
        office_user_role: input.officeRole,
        restaurant_id: null,
        created_by: createdBy,
      };
  }
}

/** Upsert pending invite; if the user already exists, apply immediately. */
export async function upsertStaffInvitation(
  input: StaffInviteInput
): Promise<
  | { status: "assigned"; email: string; profileId: string }
  | { status: "invited"; email: string }
  | { error: string }
> {
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Missing SUPABASE_SERVICE_ROLE_KEY on the server." };
  }

  const row = invitationRow(input);
  const email = row.email as string;

  let deleteQuery = admin.from("staff_invitations").delete().eq("email", email);
  if (input.kind === "platform_admin") {
    deleteQuery = deleteQuery.eq("profile_role", "admin");
  } else if (input.kind === "restaurant_manager") {
    deleteQuery = deleteQuery.eq("restaurant_id", input.restaurantId);
  } else {
    deleteQuery = deleteQuery.eq("office_id", input.officeId);
  }
  await deleteQuery;

  const { error: insertError } = await admin.from("staff_invitations").insert(row);
  if (insertError) {
    return { error: insertError.message };
  }

  const existing = await findProfileIdByEmailAdmin(email);
  if (!existing) {
    return { status: "invited", email };
  }

  const { error: applyError } = await admin.rpc("apply_staff_invitations_for_user", {
    p_user_id: existing.id,
    p_email: email,
  });

  if (applyError) {
    return { error: applyError.message };
  }

  return { status: "assigned", email, profileId: existing.id };
}

export function staffRoleLabel(role: UserRole): string {
  switch (role) {
    case "admin":
      return "Platform admin";
    case "restaurant_manager":
      return "Restaurant manager";
    case "office_admin":
      return "Office admin";
    default:
      return "Employee";
  }
}
