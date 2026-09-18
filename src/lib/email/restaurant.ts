import { Resend } from "resend";
import { formatCents } from "@/lib/money/format";
import { BRAND } from "@/lib/brand";
import type { ProductionSheetItem } from "@/types/database";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

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
    items: { name: string; qty: number; priceCents: number; instructions: string | null }[];
    totalCents: number;
  }[];
  grandTotalCents: number;
}

function buildHtml(data: RestaurantEmailPayload): string {
  const itemRows = data.productionItems
    .map(
      (g) =>
        `<tr><td style="padding:8px;border-bottom:1px solid #eee">${g.itemName}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${g.totalQuantity}</td></tr>`
    )
    .join("");

  const orderBlocks = data.orders
    .map(
      (o) => `
      <div style="margin:16px 0;padding:12px;background:#FFFBF5;border-radius:8px;border-left:4px solid #D62828">
        <strong>${o.customerName}</strong> (${o.customerEmail})<br/>
        ${o.items.map((i) => `${i.qty}× ${i.name} — ${formatCents(i.priceCents * i.qty)}${i.instructions ? ` <em>(${i.instructions})</em>` : ""}`).join("<br/>")}
        <br/><strong>Order total: ${formatCents(o.totalCents)}</strong>
      </div>`
    )
    .join("");

  return `
    <div style="font-family:sans-serif;max-width:640px;margin:0 auto">
      <div style="background:#D62828;color:white;padding:20px;border-radius:8px 8px 0 0">
        <h1 style="margin:0">${BRAND.name}</h1>
        <p style="margin:4px 0 0;opacity:0.9">Production order for ${data.lunchDate}</p>
      </div>
      <div style="padding:20px;border:1px solid #eee;border-top:0;border-radius:0 0 8px 8px">
        <h2>Delivery to: ${data.officeName}</h2>
        <p>${data.officeAddress}</p>
        ${data.deliveryInstructions ? `<p><strong>Instructions:</strong> ${data.deliveryInstructions}</p>` : ""}
        ${data.contactName ? `<p><strong>Contact:</strong> ${data.contactName}${data.contactPhone ? ` · ${data.contactPhone}` : ""}</p>` : ""}
        <p><strong>Delivery time:</strong> ${data.deliveryAt}</p>
        <h3>Items to prepare</h3>
        <table style="width:100%;border-collapse:collapse">
          <thead><tr style="background:#FDB913"><th style="padding:8px;text-align:left">Item</th><th style="padding:8px">Qty</th></tr></thead>
          <tbody>${itemRows}</tbody>
        </table>
        <h3>Customer orders</h3>
        ${orderBlocks}
        <p style="font-size:18px;margin-top:24px"><strong>Grand total: ${formatCents(data.grandTotalCents)}</strong></p>
      </div>
    </div>`;
}

export async function sendRestaurantOrderEmail(
  data: RestaurantEmailPayload
): Promise<{ sent: boolean; error?: string }> {
  const resend = getResend();
  const from = process.env.EMAIL_FROM ?? `orders@${BRAND.name.toLowerCase().replace(" ", "")}.com`;

  if (!resend) {
    console.log("[Geaux Eats] RESEND_API_KEY missing — restaurant email preview:");
    console.log(buildHtml(data));
    return { sent: false, error: "Email not configured (RESEND_API_KEY missing). Logged to console." };
  }

  if (!data.restaurantEmail) {
    return { sent: false, error: "Restaurant has no email address on file." };
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

export type { RestaurantEmailPayload };
