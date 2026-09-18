import Link from "next/link";
import { DashboardShell } from "@/components/DashboardShell";
import { Badge, Card, EmptyState } from "@/components/ui";
import { requireAdmin } from "@/lib/auth/guards";
import { formatCents } from "@/lib/money/format";
import { createClient } from "@/lib/supabase/server";
import { getRelationName } from "@/lib/supabase/relation";

export default async function AdminOrdersPage() {
  const profile = await requireAdmin();
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("*, restaurants(name), offices(name)")
    .order("created_at", { ascending: false })
    .limit(100);

  const paid = orders?.filter((o) => o.status === "paid") ?? [];
  const monthStart = new Date().toISOString().slice(0, 7) + "-01";
  const paidThisMonth = paid.filter((o) => o.created_at.slice(0, 10) >= monthStart);
  const totalSales = paidThisMonth.reduce((s, o) => s + o.total_cents, 0);
  const totalFees = paidThisMonth.reduce((s, o) => s + o.platform_fee_cents, 0);
  const totalPayout = paidThisMonth.reduce((s, o) => s + o.payout_due_cents, 0);

  return (
    <DashboardShell role={profile.role} title="Orders">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Summary
            label="Paid sales (this month)"
            value={formatCents(totalSales)}
            hint={`${paidThisMonth.length} orders — table below shows last 100 orders (any status)`}
          />
          <Summary label="Platform fees (this month)" value={formatCents(totalFees)} />
          <Summary label="Payout due (this month)" value={formatCents(totalPayout)} />
        </div>
        <Card title="All orders">
          {!orders?.length ? (
            <EmptyState message="No orders yet." />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-slate-500">
                    <th className="py-2 pr-4">Customer</th>
                    <th className="py-2 pr-4">Office</th>
                    <th className="py-2 pr-4">Restaurant</th>
                    <th className="py-2 pr-4">Total</th>
                    <th className="py-2 pr-4">Fee</th>
                    <th className="py-2 pr-4">Payout</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-slate-100">
                      <td className="py-3 pr-4">
                        <Link href={`/app/orders/${order.id}`} className="text-blue-600 hover:underline">
                          {order.customer_name}
                        </Link>
                      </td>
                      <td className="py-3 pr-4">
                        {getRelationName(order.offices)}
                      </td>
                      <td className="py-3 pr-4">
                        {getRelationName(order.restaurants)}
                      </td>
                      <td className="py-3 pr-4">{formatCents(order.total_cents)}</td>
                      <td className="py-3 pr-4">{formatCents(order.platform_fee_cents)}</td>
                      <td className="py-3 pr-4">{formatCents(order.payout_due_cents)}</td>
                      <td className="py-3">
                        <Badge tone={order.status === "paid" ? "success" : "default"}>
                          {order.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </DashboardShell>
  );
}

function Summary({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm transition-all hover:shadow-md">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
    </div>
  );
}
