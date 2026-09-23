import Link from "next/link";
import { Card, SuccessMessage } from "@/components/ui";
import { BRAND } from "@/lib/brand";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string }>;
}) {
  const { order_id: orderId } = await searchParams;

  return (
    <div className="min-h-screen bg-[var(--geaux-cream)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="geaux-header-gradient rounded-t-xl px-6 py-4 text-center">
          <h1 className="text-2xl font-black text-[var(--geaux-yellow)]">{BRAND.name}</h1>
        </div>
        <Card className="rounded-t-none">
          <SuccessMessage message="Payment confirmed! Your lunch order is on the way." />
          <p className="mt-3 text-sm text-slate-600">
            We&apos;ve sent a confirmation email with your receipt and lunch details. Check spam if
            you don&apos;t see it within a minute.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            {orderId ? (
              <>
                <Link
                  href={`/review/${orderId}`}
                  className="rounded-lg bg-[var(--geaux-red)] px-4 py-2 text-center text-sm font-semibold text-white hover:bg-[var(--geaux-red-dark)]"
                >
                  Rate your restaurant (after lunch)
                </Link>
                <Link
                  href={`/app/orders/${orderId}`}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-center text-sm font-medium text-slate-800 hover:bg-slate-50"
                >
                  View order receipt
                </Link>
              </>
            ) : null}
            <Link href="/app/week" className="text-center text-sm text-red-600 hover:underline">
              Back to this week&apos;s lunches
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
