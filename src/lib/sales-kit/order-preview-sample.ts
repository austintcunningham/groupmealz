import { brandingPreviewAssets, liveCustomerBranding } from "@/lib/restaurant/branding-display";
import { formatCents } from "@/lib/money/format";
import { createClient } from "@/lib/supabase/server";

export type SalesKitMenuPreviewItem = {
  name: string;
  price: string;
  note: string;
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

const FALLBACK: SalesKitOrderPreviewSample = {
  restaurantName: "Firehouse Subs Gonzales",
  restaurantSlug: "fhs-g",
  officeName: "Iberville Building",
  lunchDateLabel: "Monday, October 13, 2026",
  logoUrl: null,
  bannerUrl: null,
  simulatePath: "/admin/simulate-order/fhs-g",
};

const PREVIEW_ITEM_LIMIT = 6;

type MenuRow = {
  name: string;
  description: string | null;
  price_cents: number;
  promo_label?: string | null;
  promo_price_cents?: number | null;
  image_url?: string | null;
  display_order: number;
};

function toPreviewItems(rows: MenuRow[]): SalesKitMenuPreviewItem[] {
  const withPhotos = rows.filter((r) => r.image_url);
  const withoutPhotos = rows.filter((r) => !r.image_url);
  const ordered = [...withPhotos, ...withoutPhotos].slice(0, PREVIEW_ITEM_LIMIT);

  return ordered.map((item) => {
    const priceCents =
      item.promo_price_cents != null && item.promo_price_cents > 0
        ? item.promo_price_cents
        : item.price_cents;
    const note =
      item.promo_label?.trim() ||
      item.description?.trim() ||
      "As shown on the live order menu";
    return {
      name: item.name,
      price: formatCents(priceCents),
      note,
      imageUrl: item.image_url ?? undefined,
    };
  });
}

/** Real Firehouse branding + uploaded menu (with photos) for the partner sales packet. */
export async function loadSalesKitOrderPreviewSample(): Promise<SalesKitOrderPreviewSample> {
  const supabase = await createClient();

  const { data: preferred } = await supabase
    .from("restaurants")
    .select(
      "id, name, slug, logo_url, banner_url, pending_logo_url, pending_banner_url, branding_status"
    )
    .eq("slug", FALLBACK.restaurantSlug)
    .maybeSingle();

  let row = preferred;
  if (!row) {
    const { data: anyBranded } = await supabase
      .from("restaurants")
      .select(
        "id, name, slug, logo_url, banner_url, pending_logo_url, pending_banner_url, branding_status"
      )
      .or(
        "logo_url.not.is.null,banner_url.not.is.null,pending_logo_url.not.is.null,pending_banner_url.not.is.null"
      )
      .order("name")
      .limit(1)
      .maybeSingle();
    row = anyBranded;
  }

  if (!row) {
    return FALLBACK;
  }

  const live = liveCustomerBranding(row);
  const branding = live.logoUrl || live.bannerUrl ? live : brandingPreviewAssets(row);
  const slug = row.slug ?? FALLBACK.restaurantSlug;

  const { data: menuRows } = await supabase
    .from("menu_items")
    .select(
      "name, description, price_cents, promo_label, promo_price_cents, image_url, display_order"
    )
    .eq("restaurant_id", row.id)
    .eq("active", true)
    .eq("available", true)
    .order("display_order")
    .limit(40);

  const menuItems = toPreviewItems((menuRows ?? []) as MenuRow[]);

  return {
    restaurantName: row.name,
    restaurantSlug: slug,
    officeName: FALLBACK.officeName,
    lunchDateLabel: FALLBACK.lunchDateLabel,
    logoUrl: branding.logoUrl,
    bannerUrl: branding.bannerUrl,
    simulatePath: `/admin/simulate-order/${encodeURIComponent(slug)}`,
    menuItems: menuItems.length ? menuItems : undefined,
  };
}

/** Live Firehouse menu lines for kitchen-email samples in the sales packet. */
export async function loadFirehouseMenuDigestMeals(): Promise<
  { name: string; lineCents: number; specialInstructions?: string }[]
> {
  const supabase = await createClient();
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, name")
    .eq("slug", FALLBACK.restaurantSlug)
    .maybeSingle();
  if (!restaurant) return [];

  const { data: items } = await supabase
    .from("menu_items")
    .select("name, price_cents, promo_price_cents, display_order")
    .eq("restaurant_id", restaurant.id)
    .eq("active", true)
    .eq("available", true)
    .order("display_order")
    .limit(20);

  return (items ?? []).map((item, i) => ({
    name: item.name,
    lineCents:
      item.promo_price_cents != null && item.promo_price_cents > 0
        ? item.promo_price_cents
        : item.price_cents,
    ...(i === 0 ? { specialInstructions: "no lettuce or tomato, please" } : {}),
  }));
}
