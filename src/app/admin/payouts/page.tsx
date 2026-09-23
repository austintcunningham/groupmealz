import Link from "next/link";
import { DashboardShell } from "@/components/DashboardShell";
import { Card, EmptyState } from "@/components/ui";
import { RestaurantCheckStubView } from "@/components/restaurant/RestaurantCheckStub";
import { requireAdmin } from "@/lib/auth/guards";
import { getRestaurantWeeklyCheckStub } from "@/lib/actions/settlements";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPayoutsPage({
  searchParams,
}: {
  searchParams: Promise<{ restaurant?: string }>;
}) {
  const profile = await requireAdmin();
  const params = await searchParams;
  const supabase = await createClient();
  const { data: restaurants } = await supabase.from("restaurants").select("id, name").order("name");

  const restaurantId = params.restaurant ?? restaurants?.[0]?.id;
  const stub = restaurantId
    ? await getRestaurantWeeklyCheckStub(restaurantId)
    : null;

  return (
    <DashboardShell role={profile.role} title="Restaurant payouts">
      <div className="mb-6 flex flex-wrap gap-2">
        {(restaurants ?? []).map((r) => (
          <Link
            key={r.id}
            href={`/admin/payouts?restaurant=${r.id}`}
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
      {!restaurantId ? (
        <EmptyState message="Add a restaurant first." />
      ) : stub && "error" in stub ? (
        <p className="text-sm text-red-600">{stub.error}</p>
      ) : stub && "data" in stub ? (
        <Card title="This week's check stub">
          <RestaurantCheckStubView stub={stub.data} />
          <p className="mt-4 text-sm text-slate-600">
            Restaurants also see daily reports and lifetime totals under{" "}
            <Link href="/restaurant/reports" className="text-[var(--geaux-red)] hover:underline">
              Reports & payouts
            </Link>
            .
          </p>
        </Card>
      ) : null}
    </DashboardShell>
  );
}
