import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { officeOrderPath } from "@/lib/offices/slug";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AppOrderRedirectPage() {
  await requireAuth();
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: links } = await supabase.from("office_users").select("office_id").limit(1);
  if (links?.[0]?.office_id) {
    const { data: office } = await admin
      .from("offices")
      .select("slug")
      .eq("id", links[0].office_id)
      .single();
    if (office?.slug) redirect(officeOrderPath(office.slug));
  }

  const { data: anyOffice } = await admin
    .from("offices")
    .select("slug")
    .eq("active", true)
    .not("slug", "is", null)
    .limit(1)
    .maybeSingle();

  if (anyOffice?.slug) redirect(officeOrderPath(anyOffice.slug));
  redirect("/order");
}
