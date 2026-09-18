/** Canonical site origin (must match Supabase redirect URL allow list). */
export function getSiteOrigin(fallbackOrigin?: string): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    fallbackOrigin ??
    "http://localhost:3000"
  );
}

/** Redirect target for Supabase email links (password reset, etc.). */
export function buildAuthCallbackUrl(nextPath: string, fallbackOrigin?: string): string {
  const base = getSiteOrigin(fallbackOrigin);
  const next = nextPath.startsWith("/") ? nextPath : `/${nextPath}`;
  return `${base}/auth/callback?next=${encodeURIComponent(next)}`;
}

/** Alternate entry for hash-token email templates pointing at Site URL. */
export function buildAuthConfirmUrl(fallbackOrigin?: string): string {
  return `${getSiteOrigin(fallbackOrigin)}/auth/confirm`;
}
