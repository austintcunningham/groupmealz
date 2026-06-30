import Link from "next/link";
import { DashboardShell } from "@/components/DashboardShell";
import { Card, EmptyState } from "@/components/ui";
import { requireAdmin } from "@/lib/auth/guards";
import { getAdminDashboardTotals } from "@/lib/actions/reports";
import { formatCents } from "@/lib/money/format";
import { createClient } from "@/lib/supabase/server";
import { getRelationName } from "@/lib/supabase/relation";

export default async function AdminDashboardPage() {
  const profile = await requireAdmin();
  const totalsResult = await getAdminDashboardTotals();
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: schedules } = await supabase
    .from("daily_lunch_schedules")
    .select("*, offices(name), restaurants(name)")
    .eq("lunch_date", today)
    .order("delivery_at");

  const totals = "data" in totalsResult ? totalsResult.data : null;

  return (
    <DashboardShell role={profile.role} title="Admin Dashboard">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Today's schedules" value={String(totals?.todaySchedules ?? 0)} />
          <Stat label="Paid orders" value={String(totals?.paidOrderCount ?? 0)} />
          <Stat
            label="Total sales"
            value={formatCents(totals?.totalSalesCents ?? 0)}
          />
          <Stat
            label="Platform fees"
            value={formatCents(totals?.totalPlatformFeesCents ?? 0)}
          />
        </div>

        <Card title="Today's schedules">
          {!schedules?.length ? (
            <EmptyState message="No schedules for today." />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2 pr-4">Office</th>
                    <th className="py-2 pr-4">Restaurant</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2">Delivery</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((s) => (
                    <tr key={s.id} className="border-b border-slate-100">
                      <td className="py-3 pr-4">
                        {getRelationName(s.offices)}
                      </td>
                      <td className="py-3 pr-4">
                        {getRelationName(s.restaurants)}
                      </td>
                      <td className="py-3 pr-4 capitalize">{s.status}</td>
                      <td className="py-3">
                        {new Date(s.delivery_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card title="Orders by restaurant">
          {!totals?.ordersByRestaurant.length ? (
            <EmptyState message="No paid orders yet." />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2 pr-4">Restaurant</th>
                    <th className="py-2 pr-4">Orders</th>
                    <th className="py-2">Sales</th>
                  </tr>
                </thead>
                <tbody>
                  {totals.ordersByRestaurant.map((row) => (
                    <tr key={row.restaurantId} className="border-b border-slate-100">
                      <td className="py-3 pr-4">{row.restaurantName}</td>
                      <td className="py-3 pr-4">{row.orderCount}</td>
                      <td className="py-3">{formatCents(row.salesCents)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div className="flex flex-wrap gap-3">
          <QuickLink href="/admin/restaurants" label="Manage restaurants" />
          <QuickLink href="/admin/offices" label="Manage offices" />
          <QuickLink href="/admin/schedules" label="Manage schedules" />
        </div>
      </div>
    </DashboardShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
    >
      {label}
    </Link>
  );
}
