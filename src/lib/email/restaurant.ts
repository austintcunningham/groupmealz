import { formatCents } from "@/lib/money/format";
import { BRAND } from "@/lib/brand";
import { emailSection, wrapBrandedEmail } from "@/lib/email/layout";
import { getEmailFromAddress, getResendClient } from "@/lib/email/resend-client";
import type { ProductionSheetItem } from "@/types/database";

interface RestaurantEmailPayload {
  restaurantName: string;
  restaurantEmail: string;
  officeName: string;
  officeAddress: string;
  deliveryInstructions: string | null;
  contactName: string | null;
  contactPhone: string | null;
  lunchDate: string;
  deliveryAt: string;
  productionItems: ProductionSheetItem[];
  orders: {
    customerName: string;
    customerEmail: string;
    customerNote?: string | null;
    items: { name: string; qty: number; priceCents: number; instructions: string | null }[];
    totalCents: number;
  }[];
  grandTotalCents: number;
}

function buildHtml(data: RestaurantEmailPayload): string {
  const itemRows = data.productionItems
    .map(
      (g) =>
        `<tr><td style="padding:8px;border-bottom:1px solid #eee;color:#334155;">${g.itemName}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center;color:#334155;">${g.totalQuantity}</td></tr>`
    )
    .join("");

  const orderBlocks = data.orders
    .map(
      (o) => `
      <div style="margin:16px 0;padding:12px;background:#FFFBF5;border-radius:8px;border-left:4px solid #D62828">
        <strong>${o.customerName}</strong> (${o.customerEmail})<br/>
        ${o.customerNote ? `<p style="margin:8px 0;font-size:14px;color:#334155;"><strong>Customer note:</strong> ${o.customerNote}</p>` : ""}
        ${o.items.map((i) => `${i.qty}× ${i.name} — ${formatCents(i.priceCents * i.qty)}${i.instructions ? ` <em>(${i.instructions})</em>` : ""}`).join("<br/>")}
        <br/><strong>Order total: ${formatCents(o.totalCents)}</strong>
      </div>`
    )
    .join("");

  const bodyHtml = `
    ${emailSection(
      "Delivery",
      `<p style="margin:0 0 8px;font-size:15px;color:#334155;"><strong>${data.officeName}</strong><br/>${data.officeAddress}</p>
      ${data.deliveryInstructions ? `<p style="margin:0 0 8px;font-size:14px;color:#334155;"><strong>Instructions:</strong> ${data.deliveryInstructions}</p>` : ""}
      ${data.contactName ? `<p style="margin:0;font-size:14px;color:#334155;"><strong>Contact:</strong> ${data.contactName}${data.contactPhone ? ` · ${data.contactPhone}` : ""}</p>` : ""}
      <p style="margin:12px 0 0;font-size:14px;color:#334155;"><strong>Delivery time:</strong> ${data.deliveryAt}</p>`
    )}
    ${emailSection(
      "Items to prepare",
      `<table style="width:100%;border-collapse:collapse">
        <thead><tr style="background:#FDB913"><th style="padding:8px;text-align:left">Item</th><th style="padding:8px">Qty</th></tr></thead>
        <tbody>${itemRows}</tbody>
      </table>`
    )}
    ${emailSection("Customer orders", orderBlocks)}
    <p style="font-size:18px;margin-top:8px;color:#334155;"><strong>Grand total: ${formatCents(data.grandTotalCents)}</strong></p>`;

  return wrapBrandedEmail({
    preheader: `Production order for ${data.lunchDate} — ${data.officeName}`,
    headline: "Kitchen order sheet",
    subheadline: `${data.restaurantName} · ${data.lunchDate}`,
    bodyHtml,
  });
}

export async function sendRestaurantOrderEmail(
  data: RestaurantEmailPayload
): Promise<{ sent: boolean; error?: string }> {
  const resend = getResendClient();
  const from = getEmailFromAddress();

  if (!resend) {
    console.log(`[${BRAND.name}] RESEND_API_KEY missing — restaurant email preview:`);
    console.log(buildHtml(data));
    return { sent: false, error: "Email not configured (RESEND_API_KEY missing). Logged to console." };
  }

  const { error } = await resend.emails.send({
    from,
    to: data.restaurantEmail,
    subject: `${BRAND.name} order — ${data.officeName} — ${data.lunchDate}`,
    html: buildHtml(data),
  });

  if (error) return { sent: false, error: error.message };
  return { sent: true };
}
