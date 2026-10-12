import { menuImageExtension, validateMenuImageFile } from "@/lib/storage/menu-images";

export const RESTAURANT_BRANDING_BUCKET = "restaurant-branding";

export { validateMenuImageFile as validateBrandingImageFile };

export function brandingObjectPath(
  restaurantId: string,
  kind: "logo" | "banner",
  mime: string
): string {
  return `${restaurantId}/${kind}-${Date.now()}.${menuImageExtension(mime)}`;
}

export function brandingPathFromPublicUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${RESTAURANT_BRANDING_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(url.slice(idx + marker.length));
}
