import Link from "next/link";
import { DashboardShell } from "@/components/DashboardShell";
import { Card, EmptyState } from "@/components/ui";
import { getProductionSheet } from "@/lib/actions/reports";
import { requireRestaurantManager } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { getRelationName } from "@/lib/supabase/relation";

export default async function ProductionPage({
  searchParams,
}: {
  searchParams: Promise<{ schedule?: string }>;
}) {
  const profile = await requireRestaurantManager();
  const { schedule: scheduleId } = await searchParams;
  const supabase = await createClient();

  const { data: links } = await supabase
    .from("restaurant_users")
    .select("restaurant_id")
    .eq("user_id", profile.id);
  const restaurantIds = links?.map((l) => l.restaurant_id) ?? [];

  let scheduleQuery = supabase
    .from("daily_lunch_schedules")
    .select("id, lunch_date, status, offices(name), restaurants(name)")
    .gte("lunch_date", new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10))
    .order("lunch_date", { ascending: false })
    .limit(30);

  if (profile.role !== "admin" && restaurantIds.length > 0) {
    scheduleQuery = scheduleQuery.in("restaurant_id", restaurantIds);
  }

  const { data: schedules } = await scheduleQuery;

  const selectedId = scheduleId ?? schedules?.[0]?.id;
  const sheet = selectedId ? await getProductionSheet(selectedId) : null;
  const items = sheet && "data" in sheet ? sheet.data : [];
  const selected = schedules?.find((s) => s.id === selectedId);

  return (
    <DashboardShell role={profile.role} title="Prep list">
      <p className="mb-6 max-w-2xl text-sm text-slate-600">
        <strong>Kitchen prep</strong> for a specific office lunch day: how many of each menu item to
        make, who ordered what, and special instructions. This is <em>not</em> your payout — for
        money and check stubs use{" "}
        <Link href="/restaurant/reports" className="font-medium text-[var(--geaux-red)] hover:underline">
          Sales & payouts
        </Link>
        . When the order window closes, you may also get a production summary by email.
      </p>

      <div className="space-y-6">
        <Card title="Choose lunch day">
          {!schedules?.length ? (
            <EmptyState message="No upcoming or recent schedules for your restaurant." />
          ) : (
            <div className="flex flex-wrap gap-2">
              {schedules.map((s) => (
                <Link
                  key={s.id}
                  href={`/restaurant/production?schedule=${s.id}`}
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    s.id === selectedId
                      ? "border-[var(--geaux-red)] bg-red-50 text-[var(--geaux-red)]"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {s.lunch_date} · {getRelationName(s.offices)}
                  <span className="ml-1 capitalize text-slate-500">({s.status})</span>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {selected ? (
          <p className="text-sm text-slate-700">
            Showing paid orders for{" "}
            <strong>
              {selected.lunch_date} — {getRelationName(selected.offices)}
            </strong>
          </p>
        ) : null}

        {sheet && "error" in sheet ? (
          <p className="text-red-600">{sheet.error}</p>
        ) : null}

        {!items.length ? (
          <EmptyState message="No paid orders for this lunch yet. Check back after the office ordering window." />
        ) : (
          items.map((group) => (
            <Card key={group.itemName} title={`${group.itemName} — ${group.totalQuantity} total`}>
              <div className="space-y-3">
                {group.orders.map((o) => (
                  <div
                    key={`${group.itemName}-${o.orderId}`}
                    className="rounded-lg border border-slate-100 px-3 py-2 text-sm"
                  >
                    <p className="font-medium">
                      {o.quantity}× for {o.customerName}
                    </p>
                    {o.specialInstructions ? (
                      <p className="text-slate-500">{o.specialInstructions}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </Card>
          ))
        )}
      </div>
    </DashboardShell>
  );
}
