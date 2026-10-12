import { BRAND } from "@/lib/brand";
import { buildRestaurantManagerInviteHtml } from "@/lib/email/restaurant-manager-onboarding";
import { htmlToPlainText } from "@/lib/email/html-utils";
import { emailPrimaryButton, wrapBrandedEmail } from "@/lib/email/layout";
import { sendViaResend, type SendViaResendResult } from "@/lib/email/resend-client";

export type StaffEmailDispatchResult = {
  sent: boolean;
  error?: string;
  id?: string;
  from?: string;
};

type StaffEmailExtras = {
  bcc?: string;
};

function fromResend(result: SendViaResendResult): StaffEmailDispatchResult {
  if (result.sent) {
    return { sent: true, id: result.id, from: result.from };
  }
  return { sent: false, error: result.error, from: result.from };
}

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

export async function sendStaffSignupInviteEmail(
  input: {
    to: string;
    roleTitle: string;
    placeName: string;
    signupUrl: string;
  } & StaffEmailExtras
): Promise<StaffEmailDispatchResult> {
  const html = buildStaffSignupInviteHtml(input);
  return fromResend(
    await sendViaResend({
      to: input.to,
      bcc: input.bcc,
      subject: `${BRAND.name} — you're invited as ${input.roleTitle}`,
      html,
      text: htmlToPlainText(html),
      tags: [{ name: "type", value: "staff-invite" }],
    })
  );
}

export async function sendRestaurantManagerInviteEmail(
  input: {
    to: string;
    restaurantName: string;
    signupUrl: string;
    loginUrl?: string;
    baseUrl: string;
    isExistingAccount: boolean;
  } & StaffEmailExtras
): Promise<StaffEmailDispatchResult> {
  const html = buildRestaurantManagerInviteHtml({
    restaurantName: input.restaurantName,
    signupUrl: input.signupUrl,
    loginUrl: input.loginUrl ?? input.signupUrl.replace(/\/signup\/?$/, "/login"),
    isExistingAccount: input.isExistingAccount,
    baseUrl: input.baseUrl,
  });

  return fromResend(
    await sendViaResend({
      to: input.to,
      bcc: input.bcc,
      subject: `${BRAND.name} — set up ${input.restaurantName} (menu, branding & deals)`,
      html,
      text: htmlToPlainText(html),
      tags: [{ name: "type", value: "restaurant-manager-invite" }],
    })
  );
}

export async function sendStaffAccessGrantedEmail(
  input: {
    to: string;
    roleTitle: string;
    placeName: string;
    loginUrl: string;
  } & StaffEmailExtras
): Promise<StaffEmailDispatchResult> {
  const html = buildStaffAccessGrantedHtml(input);
  return fromResend(
    await sendViaResend({
      to: input.to,
      bcc: input.bcc,
      subject: `${BRAND.name} — your manager access is ready`,
      html,
      text: htmlToPlainText(html),
      tags: [{ name: "type", value: "staff-access-granted" }],
    })
  );
}
