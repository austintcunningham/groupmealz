"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  RESTAURANT_BRANDING_BUCKET,
  brandingObjectPath,
  brandingPathFromPublicUrl,
  validateBrandingImageFile,
} from "@/lib/storage/restaurant-branding";
import { createClient } from "@/lib/supabase/server";
import {
  logAudit,
  requireProfileRole,
  type ActionResult,
} from "@/lib/actions/utils";

async function assertRestaurantBrandingAccess(
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

async function removeStoredBrandingUrl(
  supabase: Awaited<ReturnType<typeof createClient>>,
  url: string | null | undefined
) {
  if (!url) return;
  const path = brandingPathFromPublicUrl(url);
  if (!path) return;
  await supabase.storage.from(RESTAURANT_BRANDING_BUCKET).remove([path]);
}

function revalidateBrandingPaths() {
  revalidatePath("/admin/restaurants");
  revalidatePath("/admin/branding");
  revalidatePath("/restaurant/branding");
  revalidatePath("/order");
}

const restaurantSchema = z.object({
  name: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  street_address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Kitchen / payout email is required"),
  active: z.boolean().optional(),
});

export async function createRestaurant(
  input: z.infer<typeof restaurantSchema>
): Promise<ActionResult<{ id: string }>> {
  const auth = await requireProfileRole(["admin"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const parsed = restaurantSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("restaurants")
    .insert({
      ...parsed.data,
      email: parsed.data.email || null,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  await logAudit("create_restaurant", "restaurant", data.id);
  revalidatePath("/admin/restaurants");
  return { success: true, data: { id: data.id } };
}

const contactSchema = z.object({
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
});

/** Single kitchen/payout inbox for daily & weekly restaurant emails. */
export async function updateRestaurantContact(
  id: string,
  input: z.infer<typeof contactSchema>
): Promise<ActionResult> {
  const auth = await requireProfileRole(["admin"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("restaurants")
    .update({
      email: parsed.data.email.trim().toLowerCase(),
      phone: parsed.data.phone?.trim() || null,
    })
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  await logAudit("update_restaurant_contact", "restaurant", id);
  revalidatePath("/admin/restaurants");
  return { success: true, data: undefined };
}

export async function updateRestaurant(
  id: string,
  input: z.infer<typeof restaurantSchema>
): Promise<ActionResult> {
  const auth = await requireProfileRole(["admin"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const parsed = restaurantSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("restaurants")
    .update({
      ...parsed.data,
      email: parsed.data.email || null,
    })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  await logAudit("update_restaurant", "restaurant", id);
  revalidatePath("/admin/restaurants");
  return { success: true, data: undefined };
}

const brandingSchema = z.object({
  logo_url: z.string().url().optional().or(z.literal("")),
  banner_url: z.string().url().optional().or(z.literal("")),
  branding_status: z.enum(["pending", "approved", "rejected"]).optional(),
});

export async function updateRestaurantBranding(
  id: string,
  input: z.infer<typeof brandingSchema>
): Promise<ActionResult> {
  const auth = await requireProfileRole(["admin", "restaurant_manager"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const parsed = brandingSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();

  if (auth.profile.role === "restaurant_manager") {
    const { data: link } = await supabase
      .from("restaurant_users")
      .select("id")
      .eq("restaurant_id", id)
      .eq("user_id", auth.profile.id)
      .maybeSingle();
    if (!link) return { success: false, error: "Unauthorized" };

    const { error } = await supabase
      .from("restaurants")
      .update({
        pending_logo_url: parsed.data.logo_url || null,
        pending_banner_url: parsed.data.banner_url || null,
        branding_status: "pending",
      })
      .eq("id", id);
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase
      .from("restaurants")
      .update({
        logo_url: parsed.data.logo_url || null,
        banner_url: parsed.data.banner_url || null,
        ...(parsed.data.branding_status ? { branding_status: parsed.data.branding_status } : {}),
      })
      .eq("id", id);
    if (error) return { success: false, error: error.message };
  }

  revalidateBrandingPaths();
  return { success: true, data: undefined };
}

const brandingKindSchema = z.enum(["logo", "banner"]);

export async function uploadRestaurantBrandingImage(
  restaurantId: string,
  kind: z.infer<typeof brandingKindSchema>,
  formData: FormData
): Promise<ActionResult<{ url: string }>> {
  const auth = await requireProfileRole(["admin", "restaurant_manager"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const parsedId = z.string().uuid().safeParse(restaurantId);
  const parsedKind = brandingKindSchema.safeParse(kind);
  if (!parsedId.success || !parsedKind.success) {
    return { success: false, error: "Invalid request" };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { success: false, error: "Choose an image file." };
  }
  const fileError = validateBrandingImageFile(file);
  if (fileError) return { success: false, error: fileError };

  const allowed = await assertRestaurantBrandingAccess(
    parsedId.data,
    auth.profile.role,
    auth.profile.id
  );
  if (!allowed) return { success: false, error: "Unauthorized" };

  const supabase = await createClient();
  const { data: restaurant, error: fetchError } = await supabase
    .from("restaurants")
    .select("id, pending_logo_url, pending_banner_url, logo_url, banner_url")
    .eq("id", parsedId.data)
    .maybeSingle();

  if (fetchError) return { success: false, error: fetchError.message };
  if (!restaurant) return { success: false, error: "Restaurant not found" };

  const path = brandingObjectPath(parsedId.data, parsedKind.data, file.type);
  const { error: uploadError } = await supabase.storage
    .from(RESTAURANT_BRANDING_BUCKET)
    .upload(path, file, {
      cacheControl: "31536000",
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) {
    const hint = uploadError.message.includes("Bucket not found")
      ? " Run migration supabase/migrations/016_restaurant_branding_storage.sql in Supabase."
      : "";
    return { success: false, error: `${uploadError.message}${hint}` };
  }

  const { data: publicData } = supabase.storage.from(RESTAURANT_BRANDING_BUCKET).getPublicUrl(path);
  const url = publicData.publicUrl;

  const pendingField = parsedKind.data === "logo" ? "pending_logo_url" : "pending_banner_url";
  const liveField = parsedKind.data === "logo" ? "logo_url" : "banner_url";
  const previousUrl =
    auth.profile.role === "admin"
      ? parsedKind.data === "logo"
        ? restaurant.logo_url
        : restaurant.banner_url
      : parsedKind.data === "logo"
        ? restaurant.pending_logo_url
        : restaurant.pending_banner_url;

  const updatePayload: Record<string, string | null> =
    auth.profile.role === "admin"
      ? {
          [liveField]: url,
          [pendingField]: null,
          branding_status: "approved",
        }
      : {
          [pendingField]: url,
          branding_status: "pending",
        };

  const { error: updateError } = await supabase
    .from("restaurants")
    .update(updatePayload)
    .eq("id", parsedId.data);

  if (updateError) {
    await supabase.storage.from(RESTAURANT_BRANDING_BUCKET).remove([path]);
    return { success: false, error: updateError.message };
  }

  await removeStoredBrandingUrl(supabase, previousUrl);

  await logAudit(`upload_restaurant_${parsedKind.data}`, "restaurant", parsedId.data);
  revalidateBrandingPaths();
  return { success: true, data: { url } };
}

export async function reviewRestaurantBranding(
  restaurantId: string,
  decision: "approved" | "rejected"
): Promise<ActionResult> {
  const auth = await requireProfileRole(["admin"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const parsedId = z.string().uuid().safeParse(restaurantId);
  if (!parsedId.success) return { success: false, error: "Invalid restaurant" };

  const supabase = await createClient();
  const { data: restaurant, error: fetchError } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", parsedId.data)
    .maybeSingle();

  if (fetchError) return { success: false, error: fetchError.message };
  if (!restaurant) return { success: false, error: "Restaurant not found" };

  if (decision === "approved") {
    const nextLogo = restaurant.pending_logo_url ?? restaurant.logo_url;
    const nextBanner = restaurant.pending_banner_url ?? restaurant.banner_url;

    if (restaurant.pending_logo_url && restaurant.logo_url !== restaurant.pending_logo_url) {
      await removeStoredBrandingUrl(supabase, restaurant.logo_url);
    }
    if (restaurant.pending_banner_url && restaurant.banner_url !== restaurant.pending_banner_url) {
      await removeStoredBrandingUrl(supabase, restaurant.banner_url);
    }

    const { error } = await supabase
      .from("restaurants")
      .update({
        logo_url: nextLogo,
        banner_url: nextBanner,
        pending_logo_url: null,
        pending_banner_url: null,
        branding_status: "approved",
      })
      .eq("id", parsedId.data);

    if (error) return { success: false, error: error.message };
    await logAudit("approve_restaurant_branding", "restaurant", parsedId.data);
  } else {
    const { error } = await supabase
      .from("restaurants")
      .update({ branding_status: "rejected" })
      .eq("id", parsedId.data);
    if (error) return { success: false, error: error.message };
    await logAudit("reject_restaurant_branding", "restaurant", parsedId.data);
  }

  revalidateBrandingPaths();
  return { success: true, data: undefined };
}

export async function assignRestaurantManagerByEmail(
  restaurantId: string,
  email: string
): Promise<
  ActionResult<{
    status: "assigned" | "invited";
    email: string;
    emailSent: boolean;
    emailError?: string;
    emailId?: string;
    emailFrom?: string;
    applyError?: string;
  }>
> {
  const auth = await requireProfileRole(["admin"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const { upsertStaffInvitation, normalizeStaffEmail } = await import("@/lib/staff/invitations");
  const normalized = normalizeStaffEmail(email);
  if (!normalized) {
    return { success: false, error: "Email is required." };
  }

  const result = await upsertStaffInvitation(
    {
      kind: "restaurant_manager",
      email: normalized,
      restaurantId,
      createdBy: auth.profile.id,
    },
    { notifyEmail: auth.profile.email }
  );

  if ("error" in result) {
    return { success: false, error: result.error };
  }

  const { staffInviteEmailFailureMessage } = await import("@/lib/staff/invite-messages");
  const emailFail = staffInviteEmailFailureMessage(result);
  if (emailFail) {
    return {
      success: false,
      error: `Manager access is saved, but the invitation email failed: ${emailFail}`,
    };
  }

  revalidatePath("/admin/restaurants");
  revalidatePath("/admin/settings");
  revalidatePath("/restaurant");
  return {
    success: true,
    data: {
      status: result.status,
      email: result.email,
      emailSent: result.emailSent,
      emailError: result.emailError,
      emailId: result.emailId,
      emailFrom: result.emailFrom,
      applyError: "applyError" in result ? result.applyError : undefined,
    },
  };
}

/** Resend manager onboarding email without changing DB (existing account). */
export async function resendRestaurantManagerInviteEmail(
  restaurantId: string,
  email: string
): Promise<
  ActionResult<{
    email: string;
    emailSent: boolean;
    emailError?: string;
    emailId?: string;
    emailFrom?: string;
  }>
> {
  const auth = await requireProfileRole(["admin"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const { normalizeStaffEmail, sendStaffInvitationEmail } = await import(
    "@/lib/staff/invitations"
  );
  const normalized = normalizeStaffEmail(email);
  if (!normalized) {
    return { success: false, error: "Email is required." };
  }

  const { createAdminClient } = await import("@/lib/supabase/admin");
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { success: false, error: "Missing SUPABASE_SERVICE_ROLE_KEY on the server." };
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .ilike("email", normalized)
    .maybeSingle();

  const mail = await sendStaffInvitationEmail(
    {
      kind: "restaurant_manager",
      email: normalized,
      restaurantId,
    },
    Boolean(profile),
    auth.profile.email
  );

  if ("error" in mail) {
    return { success: false, error: mail.error };
  }

  const { staffInviteEmailFailureMessage } = await import("@/lib/staff/invite-messages");
  const emailFail = staffInviteEmailFailureMessage(mail);
  if (emailFail) {
    return { success: false, error: emailFail };
  }

  return {
    success: true,
    data: {
      email: normalized,
      emailSent: mail.emailSent,
      emailError: mail.emailError,
      emailId: mail.emailId,
      emailFrom: mail.emailFrom,
    },
  };
}
