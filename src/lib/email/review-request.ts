import { BRAND } from "@/lib/brand";
import { htmlToPlainText } from "@/lib/email/html-utils";
import { emailPrimaryButton, wrapBrandedEmail } from "@/lib/email/layout";
import { normalizeDeliverableEmail } from "@/lib/email/email-routing";
import { getEmailFromAddress, getReplyToAddress, getResendClient } from "@/lib/email/resend-client";

export function buildReviewRequestHtml(input: {
  customerName: string;
  restaurantName: string;
  lunchDateLabel: string;
  reviewUrl: string;
  omitLogo?: boolean;
}): string {
  const bodyHtml = `
    <p style="margin:0 0 16px;font-size:16px;line-height:1.5;color:#334155 !important;">
      Hi ${input.customerName}, hope lunch from <strong>${input.restaurantName}</strong> hit the spot
      on ${input.lunchDateLabel}.
    </p>
    <p style="margin:0 0 8px;font-size:15px;line-height:1.5;color:#334155 !important;">
      Take a minute to rate your meal — it helps the restaurant and ${BRAND.name} improve office
      lunches.
    </p>
    ${emailPrimaryButton(input.reviewUrl, "Rate your lunch →")}`;

  return wrapBrandedEmail({
    preheader: `How was ${input.restaurantName}? Quick rating for your office lunch.`,
    headline: "How was lunch?",
    subheadline: input.restaurantName,
    bodyHtml,
    footerNote: `One review per order. Questions? ${BRAND.supportEmail}`,
    omitLogo: input.omitLogo,
  });
}

export async function sendReviewRequestEmail(input: {
  to: string;
  customerName: string;
  restaurantName: string;
  lunchDateLabel: string;
  reviewUrl: string;
}): Promise<{ sent: boolean; error?: string }> {
  const resend = getResendClient();
  if (!resend) {
    return { sent: false, error: "RESEND_API_KEY missing" };
  }

  const html = buildReviewRequestHtml({
    customerName: input.customerName,
    restaurantName: input.restaurantName,
    lunchDateLabel: input.lunchDateLabel,
    reviewUrl: input.reviewUrl,
  });

  const { error } = await resend.emails.send({
    from: getEmailFromAddress(),
    to: normalizeDeliverableEmail(input.to),
    replyTo: getReplyToAddress(),
    subject: `How was ${input.restaurantName}? Rate your ${BRAND.name} lunch`,
    html,
    text: htmlToPlainText(html),
  });

  if (error) return { sent: false, error: error.message };
  return { sent: true };
}

export function sampleReviewRequestHtml(
  appBase?: string,
  options?: { omitLogo?: boolean }
): string {
  const base = (appBase ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://www.groupmeals.net").replace(
    /\/$/,
    ""
  );
  return buildReviewRequestHtml({
    customerName: "Alex",
    restaurantName: "Firehouse Subs Gonzales",
    lunchDateLabel: "Monday, October 13, 2026",
    reviewUrl: `${base}/review/demo`,
    omitLogo: options?.omitLogo,
  });
}
