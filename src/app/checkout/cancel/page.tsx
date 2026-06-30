import Link from "next/link";
import { Card } from "@/components/ui";

export default async function CheckoutCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string }>;
}) {
  const { order_id: orderId } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card title="Checkout cancelled">
          <p className="text-sm text-slate-600">
            Payment was not completed. You can return to your order and try again.
          </p>
          <div className="mt-4 flex gap-3">
            {orderId ? (
              <Link
                href={`/app/orders/${orderId}`}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
              >
                Back to order
              </Link>
            ) : null}
            <Link
              href="/app/today"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium"
            >
              Order today
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
