import Link from "next/link";
import { DashboardShell } from "@/components/DashboardShell";
import { Card, EmptyState } from "@/components/ui";
import { requireRestaurantManager } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { getRelationName } from "@/lib/supabase/relation";

export default async function RestaurantDashboardPage() {
  const profile = await requireRestaurantManager();
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: restaurantLinks } = await supabase
    .from("restaurant_users")
    .select("restaurant_id, restaurants(name)")
    .eq("user_id", profile.id);

  const restaurantIds =
    profile.role === "admin"
      ? null
      : restaurantLinks?.map((r) => r.restaurant_id) ?? [];

  let scheduleQuery = supabase
    .from("daily_lunch_schedules")
    .select("*, offices(name)")
    .eq("lunch_date", today);

  if (restaurantIds && restaurantIds.length > 0) {
    scheduleQuery = scheduleQuery.in("restaurant_id", restaurantIds);
  }

  const { data: schedules } = await scheduleQuery;

  return (
    <DashboardShell role={profile.role} title="Restaurant dashboard">
      <div className="space-y-6">
        <Card title="Your restaurants">
          {!restaurantLinks?.length && profile.role !== "admin" ? (
            <EmptyState message="No restaurant assigned." />
          ) : (
            <ul className="space-y-2 text-sm">
              {(restaurantLinks ?? []).map((link) => (
                <li key={link.restaurant_id}>
                  {getRelationName(link.restaurants)}
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Today's schedules">
          {!schedules?.length ? (
            <EmptyState message="No schedules today." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {schedules.map((s) => (
                <li key={s.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p>{getRelationName(s.offices)}</p>
                    <p className="text-slate-500 capitalize">{s.status}</p>
                  </div>
                  <Link
                    href={`/restaurant/production?schedule=${s.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Production sheet
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </DashboardShell>
  );
}
