import type { SupabaseClient } from "@supabase/supabase-js";
import { slugifyOfficeName } from "@/lib/offices/slug";

/** Set unique slugs on offices that have null or empty slug. */
export async function backfillMissingOfficeSlugs(
  supabase: SupabaseClient
): Promise<number> {
  const { data: offices, error } = await supabase.from("offices").select("id, name, slug");

  if (error) {
    throw new Error(error.message);
  }

  let updated = 0;

  for (const office of offices ?? []) {
    if (office.slug?.trim()) continue;

    const baseSlug = slugifyOfficeName(office.name) || `office-${office.id.slice(0, 6)}`;
    let slug = baseSlug;

    for (let n = 0; n < 20; n++) {
      const candidate = n === 0 ? slug : `${baseSlug}-${n + 1}`;
      const { data: clash } = await supabase
        .from("offices")
        .select("id")
        .eq("slug", candidate)
        .neq("id", office.id)
        .maybeSingle();
      if (!clash) {
        slug = candidate;
        break;
      }
    }

    const { error: updateError } = await supabase
      .from("offices")
      .update({ slug })
      .eq("id", office.id);

    if (!updateError) updated++;
  }

  return updated;
}
