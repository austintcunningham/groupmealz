import { getReviewOrderContext } from "@/lib/actions/reviews";
import { RestaurantReviewForm } from "@/components/reviews/RestaurantReviewForm";
import { Card } from "@/components/ui";

export async function OrderReviewSection({ orderId }: { orderId: string }) {
  const result = await getReviewOrderContext(orderId);
  if (!result.success) return null;

  return (
    <Card title="Rate this restaurant">
      <RestaurantReviewForm context={result.data} />
    </Card>
  );
}
