import { createAdminClient } from "@/lib/supabase/admin";
import { BRAND } from "@/lib/brand";
import { htmlToPlainText } from "@/lib/email/html-utils";
import { getEmailFromAddress, getReplyToAddress, getResendClient } from "@/lib/email/resend-client";
import { buildOrderConfirmationHtml } from "@/lib/email/order-confirmation-html";
import { getRelationName } from "@/lib/supabase/relation";

function formatLunchDate(isoDate: string): string {
  return new Date(isoDate + "T12:00:00").toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
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
  const entreeCount = items.reduce((s, i) => s + i.qty, 0);

  const html = buildOrderConfirmationHtml({
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
    entreeCount,
  });

  const lunchLabel = formatLunchDate(scheduleRow.lunch_date);
  const { error } = await resend.emails.send({
    from: getEmailFromAddress(),
    to: order.customer_email,
    replyTo: getReplyToAddress(),
    subject: `${BRAND.name} — order confirmed for ${lunchLabel}`,
    html,
    text: htmlToPlainText(html),
  });

  if (error) return { sent: false, error: error.message };
  return { sent: true };
}
