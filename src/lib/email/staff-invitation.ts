import { BRAND } from "@/lib/brand";
import { htmlToPlainText } from "@/lib/email/html-utils";
import { emailPrimaryButton, wrapBrandedEmail } from "@/lib/email/layout";
import { getEmailFromAddress, getReplyToAddress, getResendClient } from "@/lib/email/resend-client";

export function buildStaffSignupInviteHtml(input: {
  roleTitle: string;
  placeName: string;
  signupUrl: string;
}): string {
  const bodyHtml = `
    <p style="margin:0 0 16px;font-size:16px;line-height:1.5;color:#334155 !important;">
      You&apos;ve been invited as <strong>${input.roleTitle}</strong> for
      <strong>${input.placeName}</strong> on ${BRAND.name}.
    </p>
    <p style="margin:0 0 8px;font-size:15px;line-height:1.5;color:#334155 !important;">
      Create your account with <strong>this same email address</strong> — your access is already
      set up; just sign up and sign in.
    </p>
    ${emailPrimaryButton(input.signupUrl, "Create your account →")}`;

  return wrapBrandedEmail({
    preheader: `You're invited to ${BRAND.name} as ${input.roleTitle}`,
    headline: "You're invited",
    subheadline: input.placeName,
    bodyHtml,
    footerNote: `Questions? ${BRAND.supportEmail}`,
  });
}

export function buildStaffAccessGrantedHtml(input: {
  roleTitle: string;
  placeName: string;
  loginUrl: string;
}): string {
  const bodyHtml = `
    <p style="margin:0 0 16px;font-size:16px;line-height:1.5;color:#334155 !important;">
      Your ${BRAND.name} account now has <strong>${input.roleTitle}</strong> access for
      <strong>${input.placeName}</strong>.
    </p>
    ${emailPrimaryButton(input.loginUrl, "Sign in →")}`;

  return wrapBrandedEmail({
    preheader: `Your ${BRAND.name} role was updated`,
    headline: "Access granted",
    subheadline: input.placeName,
    bodyHtml,
  });
}

export async function sendStaffSignupInviteEmail(input: {
  to: string;
  roleTitle: string;
  placeName: string;
  signupUrl: string;
}): Promise<{ sent: boolean; error?: string }> {
  const resend = getResendClient();
  if (!resend) {
    return { sent: false, error: "RESEND_API_KEY missing on server" };
  }

  const html = buildStaffSignupInviteHtml(input);
  const { error } = await resend.emails.send({
    from: getEmailFromAddress(),
    to: input.to,
    replyTo: getReplyToAddress(),
    subject: `${BRAND.name} — you're invited as ${input.roleTitle}`,
    html,
    text: htmlToPlainText(html),
  });

  if (error) return { sent: false, error: error.message };
  return { sent: true };
}

export async function sendStaffAccessGrantedEmail(input: {
  to: string;
  roleTitle: string;
  placeName: string;
  loginUrl: string;
}): Promise<{ sent: boolean; error?: string }> {
  const resend = getResendClient();
  if (!resend) {
    return { sent: false, error: "RESEND_API_KEY missing on server" };
  }

  const html = buildStaffAccessGrantedHtml(input);
  const { error } = await resend.emails.send({
    from: getEmailFromAddress(),
    to: input.to,
    replyTo: getReplyToAddress(),
    subject: `${BRAND.name} — your manager access is ready`,
    html,
    text: htmlToPlainText(html),
  });

  if (error) return { sent: false, error: error.message };
  return { sent: true };
}
