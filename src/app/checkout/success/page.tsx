import Link from "next/link";
import { Card } from "@/components/ui";

export default function CheckoutSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card title="Payment submitted">
          <p className="text-sm text-slate-600">
            Thanks! Your payment is being confirmed. Order status updates when our
            server receives the Stripe webhook — do not rely on this page alone.
          </p>
          <Link
            href="/app/orders"
            className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
          >
            View my orders
          </Link>
        </Card>
      </div>
    </div>
  );
}
