import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { savePaymentMethodRecord } from "@/lib/stripe/customers";
import { getStripe } from "@/lib/stripe/client";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const supabase = createAdminClient();

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as Stripe.PaymentIntent;
    const orderId = intent.metadata?.order_id;
    if (!orderId) {
      return NextResponse.json({ error: "Missing order_id metadata" }, { status: 400 });
    }

    const { data: order } = await supabase.from("orders").select("id, status, user_id").eq("id", orderId).single();
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (order.status === "paid") return NextResponse.json({ received: true });

    await supabase
      .from("orders")
      .update({
        status: "paid",
        stripe_payment_intent_id: intent.id,
        payment_status: intent.status,
      })
      .eq("id", orderId);

    const pmId = typeof intent.payment_method === "string" ? intent.payment_method : intent.payment_method?.id;
    if (pmId && order.user_id) {
      try {
        await savePaymentMethodRecord(order.user_id, pmId);
      } catch {
        /* guest orders have no saved cards */
      }
    }

    await supabase.from("audit_log").insert({
      action: "order_paid_via_webhook",
      entity_type: "order",
      entity_id: orderId,
      metadata: { stripe_payment_intent_id: intent.id },
    });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.order_id;
    if (orderId) {
      await supabase
        .from("orders")
        .update({
          status: "paid",
          stripe_checkout_session_id: session.id,
          stripe_payment_intent_id:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id ?? null,
          payment_status: session.payment_status ?? "paid",
        })
        .eq("id", orderId)
        .eq("status", "pending_payment");
    }
  }

  return NextResponse.json({ received: true });
}
