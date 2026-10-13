"use server";

import { BRAND } from "@/lib/brand";
import { wrapBrandedEmail } from "@/lib/email/layout";
import { htmlToPlainText } from "@/lib/email/html-utils";
import {
  buildAdminFulfillmentHtml,
  buildOfficeFulfillmentHtml,
  sampleRestaurantFulfillmentHtml,
  type DigestOfficeBlock,
} from "@/lib/email/printable-order-digest";
import { getOpsDigestRecipients } from "@/lib/email/ops-recipients";
import { buildOrderConfirmationHtml } from "@/lib/email/order-confirmation-html";
import { sampleRestaurantWeeklyPayoutHtml } from "@/lib/email/weekly-restaurant-html";
import { sampleOfficeWeeklySummaryHtml } from "@/lib/email/weekly-office-html";
import { sampleOpsWeeklySummaryHtml } from "@/lib/email/weekly-ops-html";
import { sampleReviewRequestHtml } from "@/lib/email/review-request";
import {
  getEmailFromAddress,
  getEmailFromRawAddress,
  getReplyToAddress,
  getResendClient,
  sendViaResend,
} from "@/lib/email/resend-client";
import { requireProfileRole, type ActionResult } from "@/lib/actions/utils";

function fulfillmentSampleBlock(): DigestOfficeBlock {
  return {
    officeName: "Sample Office (test)",
    streetAddress: "627 N. 4th St.",
    cityStateZip: "Baton Rouge, LA 70802",
    deliveryInstructions: "Sample only — not a real delivery.",
    contactName: "Office contact",
    contactPhone: null,
    restaurantName: "Sample Restaurant",
    lunchDate: "Sample lunch date",
    deliveryAt: "12:00 PM",
    orders: [
      {
        orderId: "00000000-0000-4000-8000-000000000099",
        placedAt: "Sample timestamp",
        customerName: "Sample Customer",
        customerEmail: "customer@example.com",
        lines: [
          {
            name: "Sample entrée",
            qty: 1,
            lineCents: 1099,
            specialInstructions: "Sample kitchen note",
          },
        ],
        subtotalCents: 1099,
        taxCents: 115,
        totalCents: 1214,
      },
    ],
  };
}

export async function getEmailSetupSummary(): Promise<
  ActionResult<{
    resendConfigured: boolean;
    serviceRoleConfigured: boolean;
    cronSecretConfigured: boolean;
    from: string;
    fromAddress: string;
    replyTo: string;
    mailDomain: string;
    opsDigestRecipients: string[];
    resendDashboardUrl: string;
  }>
> {
  const auth = await requireProfileRole(["admin"]);
  if ("error" in auth) return { success: false, error: auth.error };

  return {
    success: true,
    data: {
      resendConfigured: Boolean(getResendClient()),
      serviceRoleConfigured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()),
      cronSecretConfigured: Boolean(process.env.CRON_SECRET?.trim()),
      from: getEmailFromAddress(),
      fromAddress: getEmailFromRawAddress(),
      replyTo: getReplyToAddress(),
      mailDomain: BRAND.mailDomain,
      opsDigestRecipients: getOpsDigestRecipients(),
      resendDashboardUrl: "https://resend.com/emails",
    },
  };
}

/** Sends one sample of each production email type to the ops inbox (office@groupmeals.net). */
export async function sendFulfillmentEmailSamplesToOps(): Promise<
  ActionResult<{ sent: { label: string; id: string }[]; failures: string[] }>
> {
  const auth = await requireProfileRole(["admin"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const to = BRAND.opsEmail;
  const block = fulfillmentSampleBlock();
  const payloads: { label: string; subject: string; html: string; tag: string }[] = [
    {
      label: "Customer order confirmation",
      subject: `[SAMPLE] ${BRAND.name} — order confirmed`,
      html: buildOrderConfirmationHtml({
        customerName: "Sample Customer",
        orderId: block.orders[0]!.orderId,
        restaurantName: block.restaurantName,
        officeName: block.officeName,
        lunchDate: "2026-10-13",
        deliveryAt: block.deliveryAt,
        items: [{ name: "Sample entrée", qty: 1, lineCents: 1099, instructions: "Sample note" }],
        subtotalCents: 1099,
        taxCents: 115,
        platformFeeCents: 350,
        totalCents: 1564,
        entreeCount: 1,
      }),
      tag: "sample-customer-confirmation",
    },
    {
      label: "Restaurant kitchen sheet",
      subject: `[SAMPLE] Kitchen orders — ${block.officeName}`,
      html: sampleRestaurantFulfillmentHtml(),
      tag: "sample-fulfillment-restaurant",
    },
    {
      label: "Office admin delivery summary",
      subject: `[SAMPLE] Today's delivery — ${block.officeName}`,
      html: buildOfficeFulfillmentHtml(block),
      tag: "sample-fulfillment-office",
    },
    {
      label: "Group Meals ops rollup",
      subject: `[SAMPLE] ${BRAND.name} — daily fulfillment`,
      html: buildAdminFulfillmentHtml(block.lunchDate, [
        { restaurantName: block.restaurantName, blocks: [block] },
      ]),
      tag: "sample-fulfillment-ops",
    },
  ];

  const sent: { label: string; id: string }[] = [];
  const failures: string[] = [];

  for (const p of payloads) {
    const result = await sendViaResend({
      to,
      subject: p.subject,
      html: p.html,
      text: htmlToPlainText(p.html),
      tags: [{ name: "type", value: p.tag }],
    });
    if (result.sent) sent.push({ label: p.label, id: result.id });
    else failures.push(`${p.label}: ${result.error}`);
  }

  if (!sent.length) {
    return { success: false, error: failures.join(" · ") || "No emails sent" };
  }

  return { success: true, data: { sent, failures } };
}

/** Sample weekly emails to office@groupmeals.net for layout verification. */
export async function sendWeeklyEmailSamplesToOps(): Promise<
  ActionResult<{ sent: { label: string; id: string }[]; failures: string[] }>
> {
  const auth = await requireProfileRole(["admin"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const to = BRAND.opsEmail;
  const payloads = [
    {
      label: "Weekly restaurant payout",
      subject: `[SAMPLE] ${BRAND.name} — weekly payout estimate`,
      html: sampleRestaurantWeeklyPayoutHtml(),
      tag: "sample-weekly-restaurant",
    },
    {
      label: "Weekly office summary",
      subject: `[SAMPLE] ${BRAND.name} — weekly meals`,
      html: sampleOfficeWeeklySummaryHtml(),
      tag: "sample-weekly-office",
    },
    {
      label: "Weekly ops report",
      subject: `[SAMPLE] ${BRAND.name} — weekly report`,
      html: sampleOpsWeeklySummaryHtml(),
      tag: "sample-weekly-ops",
    },
  ];

  const sent: { label: string; id: string }[] = [];
  const failures: string[] = [];

  for (const p of payloads) {
    const result = await sendViaResend({
      to,
      subject: p.subject,
      html: p.html,
      text: htmlToPlainText(p.html),
      tags: [{ name: "type", value: p.tag }],
    });
    if (result.sent) sent.push({ label: p.label, id: result.id });
    else failures.push(`${p.label}: ${result.error}`);
  }

  if (!sent.length) return { success: false, error: failures.join(" · ") };
  return { success: true, data: { sent, failures } };
}

/** Sample review invitation to the logged-in admin (same template customers receive). */
export async function sendReviewInvitationSampleToAdmin(): Promise<
  ActionResult<{ id: string; to: string }>
> {
  const auth = await requireProfileRole(["admin"]);
  if ("error" in auth) return { success: false, error: auth.error };

  const to = auth.profile.email?.trim();
  if (!to) return { success: false, error: "Your admin profile has no email." };

  const html = sampleReviewRequestHtml();
  const result = await sendViaResend({
    to,
    subject: `[SAMPLE] How was Firehouse Subs Gonzales? Rate your ${BRAND.name} lunch`,
    html,
    text: htmlToPlainText(html),
    tags: [{ name: "type", value: "sample-review-invite" }],
  });

  if (!result.sent) return { success: false, error: result.error };
  return { success: true, data: { id: result.id, to } };
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
