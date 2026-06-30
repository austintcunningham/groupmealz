import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/client";

export const runtime = "nodejs";

/**
 * Stripe webhook — trusted payment confirmation only.
 * Never trust client-side success redirects for marking orders paid.
 */
export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.order_id;

    if (!orderId) {
      return NextResponse.json({ error: "Missing order_id metadata" }, { status: 400 });
    }

    // Service role bypasses RLS — required for webhook updates.
    const supabase = createAdminClient();

    const { data: order } = await supabase
      .from("orders")
      .select("id, status")
      .eq("id", orderId)
      .single();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status === "paid") {
      return NextResponse.json({ received: true });
    }

    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id ?? null;

    const { error } = await supabase
      .from("orders")
      .update({
        status: "paid",
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id: paymentIntentId,
        payment_status: session.payment_status ?? "paid",
      })
      .eq("id", orderId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await supabase.from("audit_log").insert({
      action: "order_paid_via_webhook",
      entity_type: "order",
      entity_id: orderId,
      metadata: {
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id: paymentIntentId,
      },
    });
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.order_id;
    if (orderId) {
      const supabase = createAdminClient();
      await supabase
        .from("orders")
        .update({
          status: "failed",
          payment_status: "expired",
        })
        .eq("id", orderId)
        .eq("status", "pending_payment");
    }
  }

  return NextResponse.json({ received: true });
}
