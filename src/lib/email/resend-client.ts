import { Resend } from "resend";
import { BRAND } from "@/lib/brand";

export function getResendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  return new Resend(key);
}

export function getEmailFromAddress(): string {
  const addr =
    process.env.EMAIL_FROM?.trim() ?? `orders@${BRAND.mailDomain}`;
  if (addr.includes("<")) return addr;
  return `${BRAND.name} <${addr}>`;
}

export type SendViaResendResult =
  | { sent: true; id: string; from: string }
  | { sent: false; error: string; from: string };

export async function sendViaResend(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<SendViaResendResult> {
  const from = getEmailFromAddress();
  const resend = getResendClient();
  if (!resend) {
    return { sent: false, error: "RESEND_API_KEY missing on server", from };
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: params.to,
      replyTo: getReplyToAddress(),
      subject: params.subject,
      html: params.html,
      text: params.text,
    });

    if (error) {
      const msg = error.message || "Unknown Resend error";
      console.error("[Group Meals] Resend error:", msg, {
        to: params.to,
        subject: params.subject,
        from,
      });
      return {
        sent: false,
        error: `${msg} (from: ${from})`,
        from,
      };
    }

    if (!data?.id) {
      console.error("[Group Meals] Resend returned no message id", {
        to: params.to,
        subject: params.subject,
      });
      return {
        sent: false,
        error: "Resend did not return a message id.",
        from,
      };
    }

    console.log("[Group Meals] Email queued:", data.id, params.to);
    return { sent: true, id: data.id, from };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[Group Meals] Resend exception:", msg);
    return { sent: false, error: msg, from };
  }
}

export function getReplyToAddress(): string {
  return process.env.EMAIL_REPLY_TO?.trim() ?? BRAND.supportEmail;
}
