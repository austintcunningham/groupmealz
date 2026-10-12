import { Resend } from "resend";
import { BRAND } from "@/lib/brand";

export function getResendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  return new Resend(key);
}

/** Raw address only (no display name). */
export function getEmailFromRawAddress(): string {
  const from = getEmailFromAddress();
  const match = from.match(/<([^>]+)>/);
  return match?.[1] ?? from;
}

export function getEmailFromAddress(): string {
  const addr =
    process.env.EMAIL_FROM?.trim() ?? `orders@${BRAND.mailDomain}`;
  if (addr.includes("<")) return addr;
  return `${BRAND.name} <${addr}>`;
}

export function getReplyToAddress(): string {
  return (
    process.env.EMAIL_REPLY_TO?.trim() ?? `support@${BRAND.mailDomain}`
  );
}

export type SendViaResendResult =
  | { sent: true; id: string; from: string }
  | { sent: false; error: string; from: string };

export async function sendViaResend(params: {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  bcc?: string | string[];
  tags?: { name: string; value: string }[];
}): Promise<SendViaResendResult> {
  const from = getEmailFromAddress();
  const resend = getResendClient();
  if (!resend) {
    return { sent: false, error: "RESEND_API_KEY missing on server", from };
  }

  const toList = Array.isArray(params.to) ? params.to : [params.to];
  const bccList = params.bcc
    ? Array.isArray(params.bcc)
      ? params.bcc.filter(Boolean)
      : [params.bcc]
    : undefined;

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: toList,
      bcc: bccList?.length ? bccList : undefined,
      replyTo: getReplyToAddress(),
      subject: params.subject,
      html: params.html,
      text: params.text,
      tags: params.tags,
    });

    if (error) {
      const msg = error.message || "Unknown Resend error";
      console.error("[Group Meals] Resend error:", msg, {
        to: toList,
        subject: params.subject,
        from,
      });
      return {
        sent: false,
        error: `${msg} — verify domain ${BRAND.mailDomain} in Resend and set EMAIL_FROM to e.g. orders@${BRAND.mailDomain} on Vercel.`,
        from,
      };
    }

    if (!data?.id) {
      console.error("[Group Meals] Resend returned no message id", {
        to: toList,
        subject: params.subject,
      });
      return {
        sent: false,
        error: "Resend did not return a message id.",
        from,
      };
    }

    console.log("[Group Meals] Email queued:", data.id, toList.join(", "));
    return { sent: true, id: data.id, from };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[Group Meals] Resend exception:", msg);
    return { sent: false, error: msg, from };
  }
}
