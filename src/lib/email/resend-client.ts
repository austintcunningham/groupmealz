import { Resend } from "resend";
import { BRAND } from "@/lib/brand";

export function getResendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  return new Resend(key);
}

export function getEmailFromAddress(): string {
  return (
    process.env.EMAIL_FROM ??
    `orders@${BRAND.name.toLowerCase().replace(/\s+/g, "")}.com`
  );
}
