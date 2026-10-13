import { BRAND } from "@/lib/brand";

/** Legacy From address — not a real inbox; deliver to office@ instead. */
export const LEGACY_ORDERS_INBOX = `orders@${BRAND.mailDomain}`.toLowerCase();

function bareAddress(address: string): string {
  const trimmed = address.trim();
  const match = trimmed.match(/<([^>]+)>/);
  return (match?.[1] ?? trimmed).trim().toLowerCase();
}

/** Map orders@ → office@; leave all other addresses unchanged. */
export function normalizeDeliverableEmail(address: string): string {
  const trimmed = address.trim();
  if (!trimmed) return trimmed;

  if (bareAddress(trimmed) === LEGACY_ORDERS_INBOX) {
    const replacement = BRAND.opsEmail;
    if (trimmed.includes("<")) {
      return trimmed.replace(/<[^>]+>/, `<${replacement}>`);
    }
    return replacement;
  }
  return trimmed;
}

export function normalizeDeliverableList(list: string | string[]): string[] {
  const arr = Array.isArray(list) ? list : [list];
  return arr.filter(Boolean).map((e) => normalizeDeliverableEmail(e));
}
