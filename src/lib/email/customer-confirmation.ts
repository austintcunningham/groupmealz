import { createAdminClient } from "@/lib/supabase/admin";
import { formatCents } from "@/lib/money/format";
import { BRAND } from "@/lib/brand";
import { getEmailFromAddress, getResendClient } from "@/lib/email/resend-client";
import { emailInfoRow, emailSection, wrapBrandedEmail } from "@/lib/email/layout";
import { getRelationName } from "@/lib/supabase/relation";

function formatLunchDate(isoDate: string): string {
  return new Date(isoDate + "T12:00:00").toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function buildConfirmationHtml(data: {
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
}): string {
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
      ${data.platformFeeCents > 0 ? `<tr><td style="padding:6px 0;font-size:14px;color:#64748b;">Service fee</td><td style="padding:6px 0;text-align:right;font-size:14px;">${formatCents(data.platformFeeCents)}</td></tr>` : ""}
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

export async function sendCustomerOrderConfirmation(
  orderId: string
): Promise<{ sent: boolean; error?: string }> {
  const resend = getResendClient();
  if (!resend) {
    return {
      sent: false,
      error: "Email not configured (RESEND_API_KEY missing on server).",
    };
  }

  const supabase = createAdminClient();
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select(
      "id, customer_name, customer_email, subtotal_cents, tax_cents, platform_fee_cents, total_cents, order_items(*), restaurants(name), offices(name), daily_lunch_schedules(lunch_date, delivery_at)"
    )
    .eq("id", orderId)
    .single();

  if (fetchError || !order) {
    return { sent: false, error: fetchError?.message ?? "Order not found" };
  }

  const schedule = order.daily_lunch_schedules as
    | { lunch_date: string; delivery_at: string }
    | { lunch_date: string; delivery_at: string }[]
    | null;
  const scheduleRow = Array.isArray(schedule) ? schedule[0] : schedule;
  if (!scheduleRow) {
    return { sent: false, error: "Schedule not found for order" };
  }

  type OrderItemRow = {
    item_name_snapshot: string;
    quantity: number;
    base_price_cents: number;
    line_total_cents: number;
    special_instructions: string | null;
  };

  const items = ((order.order_items ?? []) as OrderItemRow[]).map((i) => ({
    name: i.item_name_snapshot,
    qty: i.quantity,
    lineCents: i.line_total_cents ?? i.base_price_cents * i.quantity,
    instructions: i.special_instructions,
  }));

  const html = buildConfirmationHtml({
    customerName: order.customer_name,
    orderId: order.id,
    restaurantName: getRelationName(order.restaurants) ?? "Restaurant",
    officeName: getRelationName(order.offices) ?? "Office",
    lunchDate: scheduleRow.lunch_date,
    deliveryAt: new Date(scheduleRow.delivery_at).toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
    items,
    subtotalCents: order.subtotal_cents,
    taxCents: order.tax_cents,
    platformFeeCents: order.platform_fee_cents,
    totalCents: order.total_cents,
  });

  const lunchLabel = formatLunchDate(scheduleRow.lunch_date);
  const { error } = await resend.emails.send({
    from: getEmailFromAddress(),
    to: order.customer_email,
    subject: `${BRAND.name} — order confirmed for ${lunchLabel}`,
    html,
  });

  if (error) return { sent: false, error: error.message };
  return { sent: true };
}
