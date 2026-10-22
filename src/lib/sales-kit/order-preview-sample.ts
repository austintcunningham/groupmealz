import { brandingPreviewAssets, liveCustomerBranding } from "@/lib/restaurant/branding-display";
import { CHICK_FIL_A_GONZALES } from "@/lib/sales-kit/chick-fil-a-gonzales";
import { createClient } from "@/lib/supabase/server";

export type SalesKitMenuPreviewItem = {
  name: string;
  price: string;
  note: string;
  /** Path under /public for order-screen preview (matches live menu row photos). */
  imageUrl?: string;
};

export type SalesKitOrderPreviewSample = {
  restaurantName: string;
  restaurantSlug: string;
  officeName: string;
  lunchDateLabel: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  simulatePath: string;
  menuItems?: SalesKitMenuPreviewItem[];
  orderBlurb?: string;
};

export const CHICK_FIL_A_ORDER_PREVIEW: SalesKitOrderPreviewSample = {
  restaurantName: CHICK_FIL_A_GONZALES.restaurantName,
  restaurantSlug: CHICK_FIL_A_GONZALES.restaurantSlug,
  officeName: CHICK_FIL_A_GONZALES.sampleOffice.name,
  lunchDateLabel: "Tuesday, October 13, 2026",
  logoUrl: null,
  bannerUrl: null,
  simulatePath: "/admin/simulate-order",
  menuItems: [
    {
      name: "Chick-fil-A® Chicken Sandwich Meal",
      price: "$12.49",
      note: "Sizes & combos configured per partner",
      imageUrl: "/sales-kit/menu/cfa-chicken-sandwich.jpg",
    },
    {
      name: "Spicy Chicken Sandwich Meal",
      price: "$12.49",
      note: "Sides and drinks as you define them",
      imageUrl: "/sales-kit/menu/cfa-spicy-sandwich.jpg",
    },
    {
      name: "Cobb Salad",
      price: "$10.99",
      note: "Sizes & combos configured per partner",
      imageUrl: "/sales-kit/menu/cfa-cobb-salad.jpg",
    },
  ],
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
