"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { backfillMissingOfficeSlugs } from "@/lib/offices/backfill-slugs";
import { slugifyOfficeName } from "@/lib/offices/slug";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  logAudit,
  requireProfileRole,
  type ActionResult,
} from "@/lib/actions/utils";

const officeSchema = z.object({
  name: z.string().min(1),
  company_name: z.string().optional(),
  street_address: z.string().min(1),
  suite: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  delivery_instructions: z.string().optional(),
  contact_name: z.string().optional(),
  contact_phone: z.string().optional(),
  contact_email: z.string().email().optional().or(z.literal("")),
  active: z.boolean().optional(),
});

export async function createOffice(
  input: z.infer<typeof officeSchema>
): Promise<ActionResult<{ id: string }>> {
  const auth = await requireProfileRole(["admin"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const parsed = officeSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const baseSlug = slugifyOfficeName(parsed.data.name) || "office";
  let slug = baseSlug;
  for (let n = 0; n < 20; n++) {
    const candidate = n === 0 ? slug : `${baseSlug}-${n + 1}`;
    const { data: existing } = await supabase
      .from("offices")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!existing) {
      slug = candidate;
      break;
    }
  }

  const { data, error } = await supabase
    .from("offices")
    .insert({
      ...parsed.data,
      slug,
      contact_email: parsed.data.contact_email || null,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  await logAudit("create_office", "office", data.id);
  revalidatePath("/admin/offices");
  return { success: true, data: { id: data.id } };
}

export async function updateOffice(
  id: string,
  input: z.infer<typeof officeSchema>
): Promise<ActionResult> {
  const auth = await requireProfileRole(["admin"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const parsed = officeSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("offices")
    .update({
      ...parsed.data,
      contact_email: parsed.data.contact_email || null,
    })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  await logAudit("update_office", "office", id);
  revalidatePath("/admin/offices");
  return { success: true, data: undefined };
}

/** HTML form action — redirects back with status (no client JS). */
export async function generateOfficeSlugsFormAction(): Promise<void> {
  const result = await ensureOfficeSlugs();
  if (!result.success) {
    redirect(`/admin/offices?slugError=${encodeURIComponent(result.error)}`);
  }
  redirect(
    `/admin/offices?slugOk=${result.data.updated > 0 ? result.data.updated : "0"}`
  );
}

export async function ensureOfficeSlugs(): Promise<ActionResult<{ updated: number }>> {
  const auth = await requireProfileRole(["admin"]);
  if ("error" in auth) return { success: false, error: auth.error };

  try {
    const updated = await backfillMissingOfficeSlugs(createAdminClient());
    revalidatePath("/admin/offices");
    revalidatePath("/order");
    return { success: true, data: { updated } };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not generate slugs";
    if (message.includes("Missing Supabase admin")) {
      return {
        success: false,
        error:
          "Server is missing SUPABASE_SERVICE_ROLE_KEY. Add it in Vercel → Settings → Environment Variables, then redeploy.",
      };
    }
    if (message.toLowerCase().includes("slug")) {
      return {
        success: false,
        error:
          "Database is missing the offices.slug column. Run migration supabase/migrations/003_guest_orders_office_slug.sql in Supabase SQL Editor.",
      };
    }
    return { success: false, error: message };
  }
}

export async function assignOfficeUser(
  officeId: string,
  userId: string,
  role: "office_admin" | "employee"
): Promise<ActionResult> {
  const auth = await requireProfileRole(["admin"]);
  if ("error" in auth) return { success: false, error: auth.error };

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return {
      success: false,
      error:
        "Missing SUPABASE_SERVICE_ROLE_KEY on the server. Add it in Vercel and redeploy.",
    };
  }

  if (role === "office_admin") {
    const { data: target } = await admin.from("profiles").select("role").eq("id", userId).single();
    // Keep platform admins as admin; only promote employees to office_admin.
    if (target?.role === "employee") {
      const { error: profileError } = await admin
        .from("profiles")
        .update({ role: "office_admin" })
        .eq("id", userId);
      if (profileError) return { success: false, error: profileError.message };
    }
  }

  const { error } = await admin.from("office_users").upsert(
    { office_id: officeId, user_id: userId, role },
    { onConflict: "office_id,user_id" }
  );

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/offices");
  revalidatePath("/office");
  revalidatePath("/office/employees");
  return { success: true, data: undefined };
}
