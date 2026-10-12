"use server";

import { BRAND } from "@/lib/brand";
import { wrapBrandedEmail } from "@/lib/email/layout";
import { htmlToPlainText } from "@/lib/email/html-utils";
import {
  getEmailFromAddress,
  getEmailFromRawAddress,
  getReplyToAddress,
  getResendClient,
  sendViaResend,
} from "@/lib/email/resend-client";
import { requireProfileRole, type ActionResult } from "@/lib/actions/utils";

export async function getEmailSetupSummary(): Promise<
  ActionResult<{
    resendConfigured: boolean;
    from: string;
    fromAddress: string;
    replyTo: string;
    mailDomain: string;
    resendDashboardUrl: string;
  }>
> {
  const auth = await requireProfileRole(["admin"]);
  if ("error" in auth) return { success: false, error: auth.error };

  return {
    success: true,
    data: {
      resendConfigured: Boolean(getResendClient()),
      from: getEmailFromAddress(),
      fromAddress: getEmailFromRawAddress(),
      replyTo: getReplyToAddress(),
      mailDomain: BRAND.mailDomain,
      resendDashboardUrl: "https://resend.com/emails",
    },
  };
}

export async function sendAdminTestEmail(): Promise<
  ActionResult<{ id: string; to: string; from: string }>
> {
  const auth = await requireProfileRole(["admin"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const to = auth.profile.email?.trim();
  if (!to) {
    return { success: false, error: "Your admin profile has no email address." };
  }

  const html = wrapBrandedEmail({
    preheader: "Group Meals email test",
    headline: "Email test",
    subheadline: "Delivery check",
    bodyHtml: `<p style="margin:0;font-size:15px;line-height:1.5;color:#334155 !important;">
      If you received this, Resend is configured correctly for production.
      Staff invite emails use the same sender (<strong>${getEmailFromRawAddress()}</strong>).
    </p>`,
  });

  const result = await sendViaResend({
    to,
    subject: `${BRAND.name} — test email (admin)`,
    html,
    text: htmlToPlainText(html),
    tags: [{ name: "type", value: "admin-test" }],
  });

  if (!result.sent) {
    return { success: false, error: result.error };
  }

  return {
    success: true,
    data: { id: result.id, to, from: result.from },
  };
}
