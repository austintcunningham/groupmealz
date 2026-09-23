import { Resend } from "resend";
import { BRAND } from "@/lib/brand";

export function getResendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  return new Resend(key);
}

export function getEmailFromAddress(): string {
  const addr =
    process.env.EMAIL_FROM?.trim() ??
    `orders@${BRAND.name.toLowerCase().replace(/\s+/g, "")}.com`;
  if (addr.includes("<")) return addr;
  return `${BRAND.name} <${addr}>`;
}

export function getReplyToAddress(): string {
  return process.env.EMAIL_REPLY_TO?.trim() ?? BRAND.supportEmail;
}
