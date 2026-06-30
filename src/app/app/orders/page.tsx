import Link from "next/link";
import { DashboardShell } from "@/components/DashboardShell";
import { Badge, Card, EmptyState } from "@/components/ui";
import { requireEmployee } from "@/lib/auth/guards";
import { formatCents } from "@/lib/money/format";
import { createClient } from "@/lib/supabase/server";
import { getRelationName } from "@/lib/supabase/relation";

export default async function EmployeeOrdersPage() {
  const profile = await requireEmployee();
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("*, restaurants(name)")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  return (
    <DashboardShell role={profile.role} title="My orders">
      <Card>
        {!orders?.length ? (
          <EmptyState message="No orders yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Restaurant</th>
                  <th className="py-2 pr-4">Total</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-100">
                    <td className="py-3 pr-4">
                      <Link href={`/app/orders/${order.id}`} className="text-blue-600 hover:underline">
                        {new Date(order.created_at).toLocaleDateString()}
                      </Link>
                    </td>
                    <td className="py-3 pr-4">
                      {getRelationName(order.restaurants)}
                    </td>
                    <td className="py-3 pr-4">{formatCents(order.total_cents)}</td>
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
    </DashboardShell>
  );
}
