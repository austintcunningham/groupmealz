import type { Office } from "@/types/database";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type AdminOfficesLoadResult = {
  offices: Office[];
  loadError: string | null;
  slugColumnMissing: boolean;
};

const OFFICE_SELECT =
  "id,name,company_name,street_address,suite,city,state,zip,delivery_instructions,contact_name,contact_phone,contact_email,active,created_at,updated_at";

function isMissingSlugColumn(message: string | undefined): boolean {
  if (!message) return false;
  const lower = message.toLowerCase();
  return lower.includes("slug") && (lower.includes("column") || lower.includes("schema cache"));
}

function withNullSlug(rows: Record<string, unknown>[]): Office[] {
  return rows.map((row) => ({ ...row, slug: null })) as Office[];
}

/** Load offices for /admin/offices — prefers service role after requireAdmin(). */
export async function loadOfficesForAdminPage(): Promise<AdminOfficesLoadResult> {
  let slugColumnMissing = false;

  try {
    const admin = createAdminClient();
    const probe = await admin.from("offices").select("slug").limit(1);
    if (probe.error && isMissingSlugColumn(probe.error.message)) {
      slugColumnMissing = true;
      const { data, error } = await admin.from("offices").select(OFFICE_SELECT).order("name");
      if (error) {
        return { offices: [], loadError: error.message, slugColumnMissing: true };
      }
      return { offices: withNullSlug(data ?? []), loadError: null, slugColumnMissing: true };
    }

    const { data, error } = await admin.from("offices").select("*").order("name");
    if (!error) {
      return { offices: (data ?? []) as Office[], loadError: null, slugColumnMissing };
    }
    return { offices: [], loadError: error.message, slugColumnMissing };
  } catch {
    /* Missing SUPABASE_SERVICE_ROLE_KEY — fall back to user-scoped client */
  }

  const supabase = await createClient();
  const { data, error } = await supabase.from("offices").select("*").order("name");
  if (error) {
    if (isMissingSlugColumn(error.message)) {
      slugColumnMissing = true;
      const fallback = await supabase.from("offices").select(OFFICE_SELECT).order("name");
      if (fallback.error) {
        return { offices: [], loadError: fallback.error.message, slugColumnMissing: true };
      }
      return {
        offices: withNullSlug(fallback.data ?? []),
        loadError: null,
        slugColumnMissing: true,
      };
    }
    return { offices: [], loadError: error.message, slugColumnMissing: false };
  }

  return { offices: (data ?? []) as Office[], loadError: null, slugColumnMissing };
}
