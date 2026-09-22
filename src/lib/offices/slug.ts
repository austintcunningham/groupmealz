export function slugifyOfficeName(name: string | null | undefined): string {
  if (!name?.trim()) return "";
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function officeOrderPath(slug: string): string {
  return `/order/${slug}`;
}
