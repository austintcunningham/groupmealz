import { formatCents } from "@/lib/money/format";
import { BRAND } from "@/lib/brand";
import { emailInfoRow, emailSection, wrapBrandedEmail } from "@/lib/email/layout";

function formatLunchDate(isoDate: string): string {
  return new Date(isoDate + "T12:00:00").toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export type OrderConfirmationEmailData = {
  customerName: string;
  orderId: string;
  restaurantName: string;
  officeName: string;
  lunchDate: string;
  deliveryAt: string;
  items: {
    name: string;
    qty: number;
    lineCents: number;
    instructions: string | null;
  }[];
  subtotalCents: number;
  taxCents: number;
  platformFeeCents: number;
  totalCents: number;
  entreeCount?: number;
};

export function buildOrderConfirmationHtml(data: OrderConfirmationEmailData): string {
  const itemRows = data.items
    .map(
      (i) => `
      <tr>
        <td style="padding:12px 8px;border-bottom:1px solid #e2e8f0;font-size:14px;">${i.qty}× ${i.name}${i.instructions ? `<br/><span style="font-size:12px;color:#64748b;font-style:italic;">${i.instructions}</span>` : ""}</td>
        <td style="padding:12px 8px;border-bottom:1px solid #e2e8f0;font-size:14px;text-align:right;font-weight:600;">${formatCents(i.lineCents)}</td>
      </tr>`
    )
    .join("");

  const totalsBlock = `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:8px;">
      <tr><td style="padding:6px 0;font-size:14px;color:#64748b;">Subtotal</td><td style="padding:6px 0;text-align:right;font-size:14px;">${formatCents(data.subtotalCents)}</td></tr>
      ${data.taxCents > 0 ? `<tr><td style="padding:6px 0;font-size:14px;color:#64748b;">Tax</td><td style="padding:6px 0;text-align:right;font-size:14px;">${formatCents(data.taxCents)}</td></tr>` : ""}
      ${data.platformFeeCents > 0 ? `<tr><td style="padding:6px 0;font-size:14px;color:#64748b;">Service fee${data.entreeCount ? ` (${data.entreeCount} entrée${data.entreeCount === 1 ? "" : "s"})` : ""}</td><td style="padding:6px 0;text-align:right;font-size:14px;">${formatCents(data.platformFeeCents)}</td></tr>` : ""}
      <tr>
        <td style="padding:12px 0 0;font-size:16px;font-weight:700;color:#D62828;border-top:2px solid #FDB913;">Total paid</td>
        <td style="padding:12px 0 0;text-align:right;font-size:18px;font-weight:800;color:#D62828;border-top:2px solid #FDB913;">${formatCents(data.totalCents)}</td>
      </tr>
    </table>`;

  const bodyHtml = `
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;">Hi ${data.customerName},</p>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;">Thanks for ordering with <strong>${BRAND.name}</strong>. Your payment went through — here&apos;s your receipt.</p>

    ${emailSection(
      "Lunch details",
      emailInfoRow("Restaurant", data.restaurantName) +
        emailInfoRow("Office", data.officeName) +
        emailInfoRow("Lunch date", formatLunchDate(data.lunchDate)) +
        emailInfoRow("Delivery window", data.deliveryAt)
    )}

    ${emailSection(
      "Your order",
      `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
        <thead><tr style="background:#FDB913;">
          <th style="padding:10px 8px;text-align:left;font-size:12px;font-weight:700;">Item</th>
          <th style="padding:10px 8px;text-align:right;font-size:12px;font-weight:700;">Amount</th>
        </tr></thead>
        <tbody>${itemRows}</tbody>
      </table>
      ${totalsBlock}`
    )}

    <p style="margin:0;font-size:13px;color:#64748b;line-height:1.5;">Order reference: <code style="background:#fff;padding:2px 6px;border-radius:4px;font-size:12px;">${data.orderId.slice(0, 8).toUpperCase()}</code></p>`;

  return wrapBrandedEmail({
    preheader: `You're all set for lunch on ${formatLunchDate(data.lunchDate)} — ${formatCents(data.totalCents)} paid.`,
    headline: "Order confirmed",
    subheadline: formatLunchDate(data.lunchDate),
    bodyHtml,
    footerNote: `Save this email as your receipt. Questions? ${BRAND.supportEmail}`,
  });
}

/** Sample receipt for admin preview (matches a typical $1 + $2.50 fee order). */
export function sampleOrderConfirmationHtml(): string {
  return buildOrderConfirmationHtml({
    customerName: "Austin",
    orderId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    restaurantName: "Partner Kitchen",
    officeName: "TEST Office",
    lunchDate: "2026-09-19",
    deliveryAt: "Fri, Sep 19, 12:00 PM",
    items: [{ name: "Test Lunch Item", qty: 1, lineCents: 100, instructions: null }],
    subtotalCents: 100,
    taxCents: 0,
    platformFeeCents: 250,
    totalCents: 350,
    entreeCount: 1,
  });
}
