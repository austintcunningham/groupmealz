import { BRAND } from "@/lib/brand";
import { normalizeDeliverableEmail } from "@/lib/email/email-routing";

/** Ops / Group Meals admin inbox for the daily fulfillment rollup. */
export function getOpsDigestRecipients(): string[] {
  const base = [BRAND.opsEmail.trim().toLowerCase()];
  const extra =
    process.env.OPS_DIGEST_EMAILS?.split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean) ?? [];
  return [...new Set([...base, ...extra].map((e) => normalizeDeliverableEmail(e)))];
}
