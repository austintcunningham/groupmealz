import Link from "next/link";
import { DashboardShell } from "@/components/DashboardShell";
import { Card, EmptyState } from "@/components/ui";
import { requireEmployee } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { getRelationName } from "@/lib/supabase/relation";

export default async function EmployeeHomePage() {
  const profile = await requireEmployee();
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: schedule } = await supabase
    .from("daily_lunch_schedules")
    .select("*, restaurants(name)")
    .eq("lunch_date", today)
    .in("status", ["open", "closed"])
    .maybeSingle();

  const { data: recentOrders } = await supabase
    .from("orders")
    .select("id, status, total_cents, created_at")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <DashboardShell role={profile.role} title={`Welcome, ${profile.full_name || profile.email}`}>
      <div className="space-y-6">
        <Card title="Today's lunch">
          {schedule ? (
            <div>
              <p className="text-lg font-medium">
                {getRelationName(schedule.restaurants)}
              </p>
              <p className="text-sm text-slate-600">
                Cutoff: {new Date(schedule.order_cutoff_at).toLocaleString()}
              </p>
              <Link
                href="/app/today"
                className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
              >
                Order now
              </Link>
            </div>
          ) : (
            <EmptyState message="No restaurant scheduled for your office today." />
          )}
        </Card>
        <Card title="Recent orders">
          {!recentOrders?.length ? (
            <EmptyState message="You haven't placed any orders yet." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentOrders.map((o) => (
                <li key={o.id} className="flex justify-between py-3 text-sm">
                  <Link href={`/app/orders/${o.id}`} className="text-blue-600 hover:underline">
                    Order {o.id.slice(0, 8)}
                  </Link>
                  <span className="capitalize">{o.status}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </DashboardShell>
  );
}
