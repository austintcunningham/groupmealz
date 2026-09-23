import Link from "next/link";
import { DashboardShell } from "@/components/DashboardShell";
import { Card, EmptyState } from "@/components/ui";
import { ReportsWeekNav } from "@/components/restaurant/ReportsWeekNav";
import { RestaurantCheckStubView } from "@/components/restaurant/RestaurantCheckStub";
import { requireRestaurantManager } from "@/lib/auth/guards";
import {
  getRestaurantDailySummaries,
  getRestaurantLifetimeTotals,
  getRestaurantWeeklyCheckStub,
} from "@/lib/actions/settlements";
import {
  getRestaurantReviewSummary,
  listRestaurantReviewsForManager,
} from "@/lib/actions/reviews";
import { ReviewList } from "@/components/reviews/ReviewList";
import { createClient } from "@/lib/supabase/server";
import { formatCents } from "@/lib/money/format";
import { weekBoundsForDate } from "@/lib/accounting/restaurant-settlement";

function formatLunchDate(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default async function RestaurantReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ restaurant?: string; week?: string }>;
}) {
  const profile = await requireRestaurantManager();
  const params = await searchParams;
  const supabase = await createClient();

  const { data: links } = await supabase
    .from("restaurant_users")
    .select("restaurant_id, restaurants(id, name)")
    .eq("user_id", profile.id);

  let restaurants =
    profile.role === "admin"
      ? (await supabase.from("restaurants").select("id, name").order("name")).data ?? []
      : (links ?? []).map((l) => {
          const r = l.restaurants as { id: string; name: string } | { id: string; name: string }[] | null;
          const row = Array.isArray(r) ? r[0] : r;
          return row ? { id: row.id, name: row.name } : null;
        }).filter(Boolean) as { id: string; name: string }[];

  const restaurantId = params.restaurant ?? restaurants[0]?.id;
  const restaurantName = restaurants.find((r) => r.id === restaurantId)?.name;

  if (!restaurantId) {
    return (
      <DashboardShell role={profile.role} title="Sales & payouts">
        <EmptyState message="No restaurant assigned." />
      </DashboardShell>
    );
  }

  const weekAnchor = params.week ?? new Date().toISOString().slice(0, 10);
  const [daily, lifetime, stub, reviewSummary, reviewsResult] = await Promise.all([
    getRestaurantDailySummaries(restaurantId),
    getRestaurantLifetimeTotals(restaurantId),
    getRestaurantWeeklyCheckStub(restaurantId, weekAnchor),
    getRestaurantReviewSummary(restaurantId),
    listRestaurantReviewsForManager(restaurantId, 15),
  ]);
  const reviews = reviewsResult.success ? reviewsResult.data : [];

  const period = weekBoundsForDate(weekAnchor);

  return (
    <DashboardShell role={profile.role} title="Sales & payouts">
      <p className="mb-6 max-w-2xl text-sm text-slate-600">
        Track sales by <strong>lunch day</strong>, see your <strong>weekly check stub</strong> (what
        Group Meals owes you after commission and card fees), and review all-time totals. Need what to
        cook? Use{" "}
        <Link href="/restaurant/production" className="font-medium text-[var(--geaux-red)] hover:underline">
          Prep list
        </Link>{" "}
        for item counts per office day.
      </p>

      {restaurants.length > 1 ? (
        <div className="mb-6 flex flex-wrap gap-2">
          {restaurants.map((r) => (
            <Link
              key={r.id}
              href={`/restaurant/reports?restaurant=${r.id}&week=${weekAnchor}`}
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
      ) : restaurantName ? (
        <p className="mb-4 text-sm font-medium text-slate-800">{restaurantName}</p>
      ) : null}

      <Card title="Weekly check stub (your payout record)">
        <ReportsWeekNav
          weekAnchor={weekAnchor}
          periodLabel={period.label}
          restaurantId={restaurantId}
        />
        <p className="mb-4 text-xs text-slate-500">
          Based on paid orders for lunches scheduled Mon–Sun in this week. Group Meals sends payout
          outside the app — save this stub for your records.
        </p>
        {"error" in stub ? (
          <p className="text-sm text-red-600">{stub.error}</p>
        ) : (
          <RestaurantCheckStubView stub={stub.data} />
        )}
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Sales by lunch day">
          {"error" in daily ? (
            <p className="text-sm text-red-600">{daily.error}</p>
          ) : !daily.data.length ? (
            <EmptyState message="No paid orders yet — totals appear after your first ROTD service." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-slate-500">
                    <th className="py-2 pr-4">Lunch date</th>
                    <th className="py-2 pr-4">Orders</th>
                    <th className="py-2 pr-4">Food sold</th>
                    <th className="py-2">Your payout</th>
                  </tr>
                </thead>
                <tbody>
                  {daily.data.map((row) => (
                    <tr key={row.lunchDate} className="border-b border-slate-100">
                      <td className="py-2 pr-4 font-medium">{formatLunchDate(row.lunchDate)}</td>
                      <td className="py-2 pr-4">{row.orderCount}</td>
                      <td className="py-2 pr-4">{formatCents(row.subtotalCents)}</td>
                      <td className="py-2 font-medium text-green-700">
                        {formatCents(row.payoutCents)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card title="All-time on Group Meals">
          {"error" in lifetime ? (
            <p className="text-sm text-red-600">{lifetime.error}</p>
          ) : (
            <>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-slate-500">Paid orders</dt>
                  <dd className="text-xl font-bold">{lifetime.data.orderCount}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Food sales</dt>
                  <dd className="text-xl font-bold">{formatCents(lifetime.data.subtotalCents)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Gross (food + tax + tips)</dt>
                  <dd className="text-lg font-semibold">{formatCents(lifetime.data.grossSalesCents)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Total owed to you</dt>
                  <dd className="text-lg font-semibold text-green-700">
                    {formatCents(lifetime.data.payoutCents)}
                  </dd>
                </div>
              </dl>
              <p className="mt-4 text-xs text-slate-500">
                Platform commission all-time: {formatCents(lifetime.data.commissionCents)}
              </p>
            </>
          )}
        </Card>
      </div>

      <Card title="Customer feedback" className="mt-6">
        {reviewSummary.count > 0 && reviewSummary.averageRating != null ? (
          <p className="mb-4 text-sm text-slate-600">
            <strong>{reviewSummary.averageRating}</strong> / 5 average from{" "}
            <strong>{reviewSummary.count}</strong> verified order
            {reviewSummary.count === 1 ? "" : "s"}.
          </p>
        ) : (
          <p className="mb-4 text-sm text-slate-600">
            Reviews appear when customers rate a completed order (email link or order receipt).
          </p>
        )}
        <ReviewList reviews={reviews} showOffice />
      </Card>
    </DashboardShell>
  );
}
