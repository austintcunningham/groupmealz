import Link from "next/link";
import { DashboardShell } from "@/components/DashboardShell";
import { Card, EmptyState } from "@/components/ui";
import { ReviewList } from "@/components/reviews/ReviewList";
import { listRestaurantReviewsForAdmin } from "@/lib/actions/reviews";
import { requireAdmin } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ restaurant?: string }>;
}) {
  const profile = await requireAdmin();
  const params = await searchParams;
  const supabase = await createClient();
  const { data: restaurants } = await supabase.from("restaurants").select("id, name").order("name");

  const restaurantId = params.restaurant;
  const reviewsResult = await listRestaurantReviewsForAdmin(restaurantId);

  const reviews = reviewsResult.success ? reviewsResult.data : [];
  const avg =
    reviews.length > 0
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
      : null;

  return (
    <DashboardShell role={profile.role} title="Restaurant feedback">
      <p className="mb-6 max-w-2xl text-sm text-slate-600">
        Verified reviews from customers who completed a paid order — one review per order, tied to
        a specific restaurant and office lunch.
      </p>

      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/admin/reviews"
          className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
            !restaurantId
              ? "bg-[var(--geaux-red)] text-white"
              : "border border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          All restaurants
        </Link>
        {(restaurants ?? []).map((r) => (
          <Link
            key={r.id}
            href={`/admin/reviews?restaurant=${r.id}`}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              r.id === restaurantId
                ? "bg-[var(--geaux-red)] text-white"
                : "border border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            {r.name}
          </Link>
        ))}
      </div>

      <Card title={restaurantId ? "Reviews for selected restaurant" : "All reviews"}>
        {!reviewsResult.success ? (
          <p className="text-sm text-red-600">{reviewsResult.error}</p>
        ) : !reviews.length ? (
          <EmptyState message="No reviews yet. They appear after customers rate a paid order." />
        ) : (
          <>
            {avg != null ? (
              <p className="mb-4 text-sm text-slate-600">
                <strong>{avg}</strong> average · {reviews.length} review
                {reviews.length === 1 ? "" : "s"} in this view
              </p>
            ) : null}
            <ReviewList reviews={reviews} showOffice />
          </>
        )}
      </Card>
    </DashboardShell>
  );
}
