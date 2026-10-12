import Link from "next/link";
import { DashboardShell } from "@/components/DashboardShell";
import { CutoffCountdown } from "@/components/scheduling/CutoffCountdown";
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

  const { data: todayOrder } = schedule
    ? await supabase
        .from("orders")
        .select("id, status")
        .eq("user_id", profile.id)
        .eq("schedule_id", schedule.id)
        .in("status", ["pending_payment", "authorized", "paid"])
        .maybeSingle()
    : { data: null };

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
              {schedule.status === "open" ? <CutoffCountdown schedule={schedule} /> : null}
              {todayOrder ? (
                <p className="mt-3 text-sm text-slate-700">
                  You have an order for today —{" "}
                  <Link href={`/app/orders/${todayOrder.id}`} className="font-medium text-[var(--geaux-red)] hover:underline">
                    View order
                  </Link>
                  <span className="ml-1 capitalize text-slate-500">({todayOrder.status.replace("_", " ")})</span>
                </p>
              ) : null}
              <Link
                href="/app/order"
                className="mt-4 inline-block rounded-lg bg-[var(--geaux-red)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--geaux-red-dark)]"
              >
                {todayOrder ? "Change or add items" : "Order now"}
              </Link>
              <Link href="/app/week" className="ml-3 text-sm text-red-600 hover:underline">
                This week →
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
