import Link from "next/link";
import { RestaurantReviewForm } from "@/components/reviews/RestaurantReviewForm";
import { Card, ErrorMessage } from "@/components/ui";
import { getReviewOrderContext } from "@/lib/actions/reviews";
import { BRAND } from "@/lib/brand";

function formatLunchDate(iso: string): string {
  if (!iso) return "";
  return new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default async function ReviewOrderPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const result = await getReviewOrderContext(orderId);

  if (!result.success) {
    return (
      <div className="min-h-screen bg-[var(--geaux-cream)] flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <ErrorMessage message={result.error} />
          <Link href="/" className="mt-4 inline-block text-sm text-[var(--geaux-red)] hover:underline">
            ← Home
          </Link>
        </Card>
      </div>
    );
  }

  const ctx = result.data;

  return (
    <div className="min-h-screen bg-[var(--geaux-cream)] p-4">
      <div className="mx-auto max-w-lg">
        <div className="geaux-header-gradient rounded-t-xl px-6 py-4 text-center">
          <p className="text-lg font-black text-[var(--geaux-yellow)]">{BRAND.name}</p>
          <h1 className="text-xl font-semibold text-white">Rate your lunch</h1>
        </div>
        <Card className="rounded-t-none">
          <p className="mb-4 text-sm text-slate-600">
            <strong>{ctx.restaurantName}</strong>
            {ctx.lunchDate ? (
              <>
                {" "}
                · {formatLunchDate(ctx.lunchDate)}
              </>
            ) : null}
            <br />
            <span className="text-slate-500">{ctx.officeName}</span>
          </p>
          <RestaurantReviewForm context={ctx} />
          <p className="mt-6 text-xs text-slate-500">
            One review per order. Feedback is shared with {BRAND.name} and the restaurant partner.
          </p>
        </Card>
      </div>
    </div>
  );
}
