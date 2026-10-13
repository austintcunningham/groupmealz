import { brandingPreviewAssets, liveCustomerBranding } from "@/lib/restaurant/branding-display";
import { createClient } from "@/lib/supabase/server";

export type SalesKitOrderPreviewSample = {
  restaurantName: string;
  restaurantSlug: string;
  officeName: string;
  lunchDateLabel: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  simulatePath: string;
};

const FALLBACK: SalesKitOrderPreviewSample = {
  restaurantName: "Firehouse Subs Gonzales",
  restaurantSlug: "fhs-g",
  officeName: "Iberville Building",
  lunchDateLabel: "Monday, October 13, 2026",
  logoUrl: null,
  bannerUrl: null,
  simulatePath: "/admin/simulate-order/fhs-g",
};

/** Real restaurant branding when available — used in the partner sales packet. */
export async function loadSalesKitOrderPreviewSample(): Promise<SalesKitOrderPreviewSample> {
  const supabase = await createClient();

  const { data: preferred } = await supabase
    .from("restaurants")
    .select(
      "name, slug, logo_url, banner_url, pending_logo_url, pending_banner_url, branding_status"
    )
    .eq("slug", FALLBACK.restaurantSlug)
    .maybeSingle();

  let row = preferred;
  if (!row?.logo_url && !row?.banner_url && !row?.pending_logo_url && !row?.pending_banner_url) {
    const { data: anyBranded } = await supabase
      .from("restaurants")
      .select(
        "name, slug, logo_url, banner_url, pending_logo_url, pending_banner_url, branding_status"
      )
      .or(
        "logo_url.not.is.null,banner_url.not.is.null,pending_logo_url.not.is.null,pending_banner_url.not.is.null"
      )
      .order("name")
      .limit(1)
      .maybeSingle();
    row = anyBranded ?? preferred;
  }

  if (!row) {
    return FALLBACK;
  }

  const live = liveCustomerBranding(row);
  const branding =
    live.logoUrl || live.bannerUrl ? live : brandingPreviewAssets(row);
  const slug = row.slug ?? FALLBACK.restaurantSlug;

  return {
    restaurantName: row.name,
    restaurantSlug: slug,
    officeName: FALLBACK.officeName,
    lunchDateLabel: FALLBACK.lunchDateLabel,
    logoUrl: branding.logoUrl,
    bannerUrl: branding.bannerUrl,
    simulatePath: `/admin/simulate-order/${encodeURIComponent(slug)}`,
  };
}
