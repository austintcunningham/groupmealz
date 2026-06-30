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

  const { data: schedules } = await supabase
    .from("daily_lunch_schedules")
    .select("id, lunch_date, status, offices(name), restaurants(name)")
    .order("lunch_date", { ascending: false })
    .limit(20);

  const selectedId = scheduleId ?? schedules?.[0]?.id;
  const sheet = selectedId ? await getProductionSheet(selectedId) : null;
  const items = sheet && "data" in sheet ? sheet.data : [];

  return (
    <DashboardShell role={profile.role} title="Production sheet">
      <div className="space-y-6">
        <Card title="Select schedule">
          {!schedules?.length ? (
            <EmptyState message="No schedules available." />
          ) : (
            <div className="flex flex-wrap gap-2">
              {schedules.map((s) => (
                <Link
                  key={s.id}
                  href={`/restaurant/production?schedule=${s.id}`}
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    s.id === selectedId
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {s.lunch_date} · {getRelationName(s.offices)}
                </Link>
              ))}
            </div>
          )}
        </Card>

        {sheet && "error" in sheet ? (
          <p className="text-red-600">{sheet.error}</p>
        ) : null}

        {!items.length ? (
          <EmptyState message="No paid orders for this schedule yet." />
        ) : (
          items.map((group) => (
            <Card key={group.itemName} title={`${group.itemName} (${group.totalQuantity})`}>
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
