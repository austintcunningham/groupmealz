"use client";

import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe, type StripeElementsOptions } from "@stripe/stripe-js";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { confirmPaymentSaved } from "@/lib/actions/orders";
import { Button, ErrorMessage } from "@/components/ui";
import { BRAND } from "@/lib/brand";

function PaymentForm({
  orderId,
  guestCheckout = false,
}: {
  orderId: string;
  guestCheckout?: boolean;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saveCard, setSaveCard] = useState(!guestCheckout);

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);

    const returnUrl = `${window.location.origin}/checkout/success?order_id=${encodeURIComponent(orderId)}`;

    const { error: submitError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
      },
      redirect: "if_required",
    });

    if (submitError) {
      setError(submitError.message ?? "Payment failed");
      setLoading(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      const pmId =
        typeof paymentIntent.payment_method === "string"
          ? paymentIntent.payment_method
          : paymentIntent.payment_method?.id;
      if (!guestCheckout && saveCard && pmId) {
        await confirmPaymentSaved(orderId, pmId);
      }
      router.push(`/checkout/success?order_id=${orderId}`);
      return;
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handlePay} className="space-y-4">
      {error ? <ErrorMessage message={error} /> : null}
      <PaymentElement
        options={{
          layout: "tabs",
          wallets: { applePay: "never", googlePay: "never" },
        }}
      />
      {!guestCheckout ? (
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={saveCard}
            onChange={(e) => setSaveCard(e.target.checked)}
            className="rounded border-slate-300 text-red-600 focus:ring-red-500"
          />
          Save card for future orders
        </label>
      ) : null}
      <Button type="submit" loading={loading} className="w-full" size="lg">
        Pay now — card verified instantly
      </Button>
      <p className="text-xs text-slate-500">
        Payments processed securely by Stripe. {BRAND.name} never stores your card number.
      </p>
    </form>
  );
}

export function EmbeddedCheckout({
  clientSecret,
  publishableKey,
  orderId,
  guestCheckout = false,
}: {
  clientSecret: string;
  publishableKey: string;
  orderId: string;
  guestCheckout?: boolean;
}) {
  const stripePromise = loadStripe(publishableKey);
  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: "stripe",
      variables: {
        colorPrimary: "#D62828",
        colorBackground: "#FFFBF5",
        borderRadius: "8px",
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentForm orderId={orderId} guestCheckout={guestCheckout} />
    </Elements>
  );
}
