"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
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
  const { data, error } = await supabase
    .from("offices")
    .insert({
      ...parsed.data,
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

export async function assignOfficeUser(
  officeId: string,
  userId: string,
  role: "office_admin" | "employee"
): Promise<ActionResult> {
  const auth = await requireProfileRole(["admin"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const supabase = await createClient();

  if (role === "office_admin") {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ role: "office_admin" })
      .eq("id", userId);
    if (profileError) return { success: false, error: profileError.message };
  }

  const { error } = await supabase.from("office_users").upsert(
    { office_id: officeId, user_id: userId, role },
    { onConflict: "office_id,user_id" }
  );

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/offices");
  revalidatePath("/office/employees");
  return { success: true, data: undefined };
}
