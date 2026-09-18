"use client";

import { useState, useTransition } from "react";
import { createPaymentIntent } from "@/lib/actions/orders";
import { EmbeddedCheckout } from "@/components/checkout/EmbeddedCheckout";
import { Button, Card, ErrorMessage } from "@/components/ui";

export function OrderPaySection({ orderId }: { orderId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<{
    clientSecret: string;
    publishableKey: string;
  } | null>(null);

  function startPayment() {
    setError(null);
    startTransition(async () => {
      const result = await createPaymentIntent(orderId, { saveCard: true });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setPaymentData({
        clientSecret: result.data.clientSecret,
        publishableKey: result.data.publishableKey,
      });
    });
  }

  if (paymentData) {
    return (
      <Card title="Complete payment">
        <EmbeddedCheckout {...paymentData} orderId={orderId} />
      </Card>
    );
  }

  return (
    <Card title="Payment required">
      {error ? <ErrorMessage message={error} /> : null}
      <p className="mb-4 text-sm text-slate-600">
        Pay securely with Stripe — your card is verified instantly.
      </p>
      <Button loading={isPending} onClick={startPayment}>
        Pay with card
      </Button>
    </Card>
  );
}
