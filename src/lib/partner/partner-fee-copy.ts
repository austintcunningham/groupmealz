import { BRAND } from "@/lib/brand";

/** Restaurant partner messaging — fee is built into menu pricing, not sold as a separate commission story. */
export const RESTAURANT_PARTNER_SERVICE_FEE_LINE =
  "Small service fee offset by menu price adjustment.";

export const RESTAURANT_PARTNER_FEE_BULLET = {
  title: "Partner economics",
  body: RESTAURANT_PARTNER_SERVICE_FEE_LINE,
} as const;

export function restaurantStubServiceFeeLabel(): string {
  return `${BRAND.name} service fee`;
}
