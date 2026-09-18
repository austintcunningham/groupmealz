/** Redirect target for Supabase email links (password reset, etc.). */
export function buildAuthCallbackUrl(nextPath: string, origin?: string): string {
  const base =
    origin ??
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";
  const next = nextPath.startsWith("/") ? nextPath : `/${nextPath}`;
  return `${base}/auth/callback?next=${encodeURIComponent(next)}`;
}
