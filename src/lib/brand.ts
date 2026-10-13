export const BRAND = {
  name: "Group Meals",
  tagline: "Scheduled office lunch, done right.",
  supportEmail: "support@groupmeals.net",
  /** Daily fulfillment rollup + email verification samples. */
  opsEmail: "office@groupmeals.net",
  /** Verified sending domain in Resend (EMAIL_FROM must use this). */
  mailDomain: "groupmeals.net",
  /** Optimized transparent PNG in /public */
  logoPath: "/brand/group-meals-logo.png",
  /** Square speech-bubble mark only (not the wide wordmark). */
  iconMarkPath: "/brand/favicon-32.png",
  faviconPath: "/favicon.ico",
  appleTouchIconPath: "/brand/apple-touch-icon.png",
} as const;

export const COLORS = {
  red: "#D62828",
  redDark: "#B71F1F",
  yellow: "#FDB913",
  yellowLight: "#FFE082",
  cream: "#FFFBF5",
  charcoal: "#1A1A1A",
} as const;

/** Absolute URL for emails (Resend requires publicly reachable images). */
export function getBrandLogoUrl(appBase?: string): string {
  const base = (
    appBase ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "https://www.groupmeals.net"
  ).replace(/\/$/, "");
  return `${base}${BRAND.logoPath}`;
}
