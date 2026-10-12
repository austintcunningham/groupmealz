import { createAdminClient } from "@/lib/supabase/admin";
import {
  sendRestaurantManagerInviteEmail,
  sendStaffAccessGrantedEmail,
  sendStaffSignupInviteEmail,
} from "@/lib/email/staff-invitation";
import { BRAND } from "@/lib/brand";
import type { StaffInvitation, UserRole } from "@/types/database";

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

type InviteCopy = { roleTitle: string; placeName: string };

export type StaffInviteEmailResult = {
  emailSent: boolean;
  emailError?: string;
  emailId?: string;
  emailFrom?: string;
};

async function resolveInviteCopy(input: StaffInviteInput): Promise<InviteCopy> {
  const admin = createAdminClient();
  switch (input.kind) {
    case "platform_admin":
      return { roleTitle: "Platform admin", placeName: BRAND.name };
    case "restaurant_manager": {
      const { data } = await admin
        .from("restaurants")
        .select("name")
        .eq("id", input.restaurantId)
        .single();
      return {
        roleTitle: "Restaurant manager",
        placeName: data?.name ?? "your restaurant",
      };
    }
    case "office_member": {
      const { data } = await admin
        .from("offices")
        .select("name")
        .eq("id", input.officeId)
        .single();
      const roleTitle = input.officeRole === "office_admin" ? "Office admin" : "Office employee";
      return { roleTitle, placeName: data?.name ?? "your office" };
    }
  }
}

function appBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "https://www.groupmeals.net").replace(/\/$/, "");
}

async function findProfileIdByEmailAdmin(
  email: string
): Promise<{ id: string; full_name: string; email: string } | null> {
  const admin = createAdminClient();
  const normalized = normalizeStaffEmail(email);
  const { data, error } = await admin
    .from("profiles")
    .select("id, full_name, email")
    .ilike("email", normalized)
    .maybeSingle();

  if (!error && data) return data;

  let page = 1;
  for (;;) {
    const { data: list, error: listError } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (listError || !list?.users?.length) break;

    const authUser = list.users.find(
      (u) => u.email && normalizeStaffEmail(u.email) === normalized
    );
    if (authUser) {
      const { data: byId } = await admin
        .from("profiles")
        .select("id, full_name, email")
        .eq("id", authUser.id)
        .maybeSingle();
      if (byId) {
        return {
          id: byId.id,
          full_name: byId.full_name,
          email: byId.email || authUser.email || normalized,
        };
      }
      return {
        id: authUser.id,
        full_name: authUser.user_metadata?.full_name ?? "",
        email: authUser.email ?? normalized,
      };
    }

    if (list.users.length < 200) break;
    page += 1;
    if (page > 25) break;
  }

  return null;
}

function invitationRow(input: StaffInviteInput): Record<string, unknown> {
  const email = normalizeStaffEmail(input.email);
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

export function staffInvitationToInput(
  row: Pick<
    StaffInvitation,
    "email" | "profile_role" | "office_id" | "office_user_role" | "restaurant_id"
  >
): StaffInviteInput | null {
  if (row.profile_role === "admin") {
    return { kind: "platform_admin", email: row.email };
  }
  if (row.profile_role === "restaurant_manager" && row.restaurant_id) {
    return {
      kind: "restaurant_manager",
      email: row.email,
      restaurantId: row.restaurant_id,
    };
  }
  if (
    row.office_id &&
    row.office_user_role &&
    (row.profile_role === "office_admin" || row.profile_role === "employee")
  ) {
    return {
      kind: "office_member",
      email: row.email,
      officeId: row.office_id,
      officeRole: row.office_user_role,
    };
  }
  return null;
}

async function dispatchStaffInviteEmail(
  input: StaffInviteInput,
  copy: InviteCopy,
  isExistingAccount: boolean,
  notifyEmail?: string
): Promise<StaffInviteEmailResult> {
  const base = appBaseUrl();
  const to = normalizeStaffEmail(input.email);
  const bcc =
    notifyEmail && normalizeStaffEmail(notifyEmail) !== to
      ? normalizeStaffEmail(notifyEmail)
      : undefined;

  const mail =
    input.kind === "restaurant_manager"
      ? await sendRestaurantManagerInviteEmail({
          to,
          bcc,
          restaurantName: copy.placeName,
          signupUrl: `${base}/signup`,
          loginUrl: `${base}/login`,
          baseUrl: base,
          isExistingAccount,
        })
      : isExistingAccount
        ? await sendStaffAccessGrantedEmail({
            to,
            bcc,
            roleTitle: copy.roleTitle,
            placeName: copy.placeName,
            loginUrl: `${base}/login`,
          })
        : await sendStaffSignupInviteEmail({
            to,
            bcc,
            roleTitle: copy.roleTitle,
            placeName: copy.placeName,
            signupUrl: `${base}/signup`,
          });

  return {
    emailSent: mail.sent,
    emailError: mail.error,
    emailId: mail.id,
    emailFrom: mail.from,
  };
}

/** Send invite email only (no DB changes). */
export async function sendStaffInvitationEmail(
  input: StaffInviteInput,
  isExistingAccount: boolean,
  notifyEmail?: string
): Promise<StaffInviteEmailResult | { error: string }> {
  let copy: InviteCopy;
  try {
    copy = await resolveInviteCopy(input);
  } catch {
    copy = { roleTitle: "Staff", placeName: BRAND.name };
  }

  try {
    return await dispatchStaffInviteEmail(input, copy, isExistingAccount, notifyEmail);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { error: msg };
  }
}

/** Upsert pending invite; if the user already exists, apply immediately. */
export async function upsertStaffInvitation(
  input: StaffInviteInput,
  options?: { notifyEmail?: string }
): Promise<
  | {
      status: "assigned";
      email: string;
      profileId: string;
      emailSent: boolean;
      emailError?: string;
      emailId?: string;
      emailFrom?: string;
      applyError?: string;
    }
  | {
      status: "invited";
      email: string;
      emailSent: boolean;
      emailError?: string;
      emailId?: string;
      emailFrom?: string;
    }
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
    if (
      insertError.message.includes("staff_invitations") &&
      insertError.message.includes("schema cache")
    ) {
      return {
        error:
          "Database missing staff_invitations. Run migration supabase/migrations/006_staff_invitations.sql in Supabase → SQL Editor, then retry.",
      };
    }
    return { error: insertError.message };
  }

  let copy: InviteCopy;
  try {
    copy = await resolveInviteCopy(input);
  } catch {
    copy = { roleTitle: "Staff", placeName: BRAND.name };
  }

  const existing = await findProfileIdByEmailAdmin(email);

  const mail = await dispatchStaffInviteEmail(
    input,
    copy,
    Boolean(existing),
    options?.notifyEmail
  );

  if (!existing) {
    return {
      status: "invited",
      email,
      emailSent: mail.emailSent,
      emailError: mail.emailError,
      emailId: mail.emailId,
      emailFrom: mail.emailFrom,
    };
  }

  const { error: applyError } = await admin.rpc("apply_staff_invitations_for_user", {
    p_user_id: existing.id,
    p_email: email,
  });

  if (applyError) {
    return {
      status: "assigned",
      email,
      profileId: existing.id,
      emailSent: mail.emailSent,
      emailError: mail.emailError,
      emailId: mail.emailId,
      emailFrom: mail.emailFrom,
      applyError: applyError.message,
    };
  }

  return {
    status: "assigned",
    email,
    profileId: existing.id,
    emailSent: mail.emailSent,
    emailError: mail.emailError,
    emailId: mail.emailId,
    emailFrom: mail.emailFrom,
  };
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
