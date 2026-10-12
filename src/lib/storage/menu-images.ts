export const MENU_IMAGES_BUCKET = "menu-images";

const MAX_BYTES = 5 * 1024 * 1024;

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export function validateMenuImageFile(file: File): string | null {
  if (!file.size) return "Choose an image file.";
  if (file.size > MAX_BYTES) return "Image must be 5 MB or smaller.";
  if (!ALLOWED_MIME.has(file.type)) {
    return "Use JPEG, PNG, WebP, or GIF.";
  }
  return null;
}

export function menuImageExtension(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "jpg";
  }
}

/** Path inside bucket: {restaurantId}/{menuItemId}/{timestamp}.{ext} */
export function menuImageObjectPath(
  restaurantId: string,
  menuItemId: string,
  mime: string
): string {
  return `${restaurantId}/${menuItemId}/${Date.now()}.${menuImageExtension(mime)}`;
}

/** Extract object path from Supabase public URL for our bucket, if applicable. */
export function menuImagePathFromPublicUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${MENU_IMAGES_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(url.slice(idx + marker.length));
}
