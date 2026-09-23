import Link from "next/link";
import { DashboardShell } from "@/components/DashboardShell";
import { Card, EmptyState } from "@/components/ui";
import { RestaurantCheckStubView } from "@/components/restaurant/RestaurantCheckStub";
import { requireRestaurantManager } from "@/lib/auth/guards";
import {
  getRestaurantDailySummaries,
  getRestaurantLifetimeTotals,
  getRestaurantWeeklyCheckStub,
} from "@/lib/actions/settlements";
import { createClient } from "@/lib/supabase/server";
import { formatCents } from "@/lib/money/format";
import { weekBoundsForDate } from "@/lib/accounting/restaurant-settlement";

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
  if (!restaurantId) {
    return (
      <DashboardShell role={profile.role} title="Reports & payouts">
        <EmptyState message="No restaurant assigned." />
      </DashboardShell>
    );
  }

  const weekDate = params.week ?? new Date().toISOString().slice(0, 10);
  const [daily, lifetime, stub] = await Promise.all([
    getRestaurantDailySummaries(restaurantId),
    getRestaurantLifetimeTotals(restaurantId),
    getRestaurantWeeklyCheckStub(restaurantId, weekDate),
  ]);

  const period = weekBoundsForDate(weekDate);

  return (
    <DashboardShell role={profile.role} title="Reports & payouts">
      {restaurants.length > 1 ? (
        <div className="mb-6 flex flex-wrap gap-2">
          {restaurants.map((r) => (
            <Link
              key={r.id}
              href={`/restaurant/reports?restaurant=${r.id}`}
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
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Daily performance (primary)">
          {"error" in daily ? (
            <p className="text-sm text-red-600">{daily.error}</p>
          ) : !daily.data.length ? (
            <EmptyState message="No paid orders yet." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-slate-500">
                    <th className="py-2 pr-4">Lunch date</th>
                    <th className="py-2 pr-4">Orders</th>
                    <th className="py-2 pr-4">Food</th>
                    <th className="py-2">Your payout</th>
                  </tr>
                </thead>
                <tbody>
                  {daily.data.map((row) => (
                    <tr key={row.lunchDate} className="border-b border-slate-100">
                      <td className="py-2 pr-4 font-medium">{row.lunchDate}</td>
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

        <Card title="Lifetime on Group Meals">
          {"error" in lifetime ? (
            <p className="text-sm text-red-600">{lifetime.error}</p>
          ) : (
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
                <dt className="text-slate-500">Gross (incl. tax & tips)</dt>
                <dd className="text-lg font-semibold">{formatCents(lifetime.data.grossSalesCents)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Total paid to you</dt>
                <dd className="text-lg font-semibold text-green-700">
                  {formatCents(lifetime.data.payoutCents)}
                </dd>
              </div>
            </dl>
          )}
        </Card>
      </div>

      <Card title="Weekly check stub" className="mt-6">
        <p className="mb-4 text-sm text-slate-600">
          Week of {period.label}. Use arrows to change week after we add navigation — for now adjust
          the <code className="text-xs">week</code> query param (YYYY-MM-DD in that week).
        </p>
        {"error" in stub ? (
          <p className="text-sm text-red-600">{stub.error}</p>
        ) : (
          <RestaurantCheckStubView stub={stub.data} />
        )}
      </Card>
    </DashboardShell>
  );
}
