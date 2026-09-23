import Link from "next/link";
import { getReviewOrderContext } from "@/lib/actions/reviews";
import { RestaurantReviewForm } from "@/components/reviews/RestaurantReviewForm";
import { Card } from "@/components/ui";

export async function OrderReviewSection({ orderId }: { orderId: string }) {
  const result = await getReviewOrderContext(orderId);
  if (!result.success) return null;

  return (
    <Card title="Rate this restaurant">
      <p className="mb-4 text-sm text-slate-600">
        Help {result.data.restaurantName} and {result.data.officeName} improve — your review is tied
        to this paid order.
      </p>
      <RestaurantReviewForm context={result.data} />
      <p className="mt-3 text-xs text-slate-500">
        Or use{" "}
        <Link href={`/review/${orderId}`} className="text-[var(--geaux-red)] hover:underline">
          the standalone review link
        </Link>{" "}
        (handy to save from your confirmation email).
      </p>
    </Card>
  );
}
