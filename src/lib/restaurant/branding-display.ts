import type { Restaurant } from "@/types/database";

/** Logo/banner shown on live customer order pages and approved emails. */
export function liveCustomerBranding(restaurant: Pick<
  Restaurant,
  "logo_url" | "banner_url" | "branding_status"
>): { logoUrl: string | null; bannerUrl: string | null } {
  if (restaurant.branding_status !== "approved") {
    return { logoUrl: null, bannerUrl: null };
  }
  return {
    logoUrl: restaurant.logo_url ?? null,
    bannerUrl: restaurant.banner_url ?? null,
  };
}

/** Preview header — pending submission first, then current live assets. */
export function brandingPreviewAssets(restaurant: Pick<
  Restaurant,
  "logo_url" | "banner_url" | "pending_logo_url" | "pending_banner_url"
>): { logoUrl: string | null; bannerUrl: string | null } {
  return {
    logoUrl: restaurant.pending_logo_url ?? restaurant.logo_url ?? null,
    bannerUrl: restaurant.pending_banner_url ?? restaurant.banner_url ?? null,
  };
}

export function brandingNeedsReview(restaurant: Pick<
  Restaurant,
  "branding_status" | "pending_logo_url" | "pending_banner_url"
>): boolean {
  return (
    restaurant.branding_status === "pending" ||
    Boolean(restaurant.pending_logo_url || restaurant.pending_banner_url)
  );
}
