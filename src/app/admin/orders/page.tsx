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
  const totalSales = paid.reduce((s, o) => s + o.total_cents, 0);
  const totalFees = paid.reduce((s, o) => s + o.platform_fee_cents, 0);
  const totalPayout = paid.reduce((s, o) => s + o.payout_due_cents, 0);

  return (
    <DashboardShell role={profile.role} title="Orders">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Summary label="Paid order sales" value={formatCents(totalSales)} />
          <Summary label="Platform fees" value={formatCents(totalFees)} />
          <Summary label="Payout due (reporting)" value={formatCents(totalPayout)} />
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

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}
