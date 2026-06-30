import { DashboardShell } from "@/components/DashboardShell";
import { Badge, Card, EmptyState } from "@/components/ui";
import { requireOfficeAdmin } from "@/lib/auth/guards";
import { formatCents } from "@/lib/money/format";
import { createClient } from "@/lib/supabase/server";
import { getRelationName } from "@/lib/supabase/relation";

export default async function OfficeOrdersPage() {
  const profile = await requireOfficeAdmin();
  const supabase = await createClient();

  const { data: officeLinks } = await supabase
    .from("office_users")
    .select("office_id")
    .eq("user_id", profile.id);

  const officeIds = officeLinks?.map((l) => l.office_id) ?? [];

  const { data: orders } = officeIds.length
    ? await supabase
        .from("orders")
        .select("*, profiles(full_name), restaurants(name)")
        .in("office_id", officeIds)
        .order("created_at", { ascending: false })
        .limit(100)
    : { data: [] };

  return (
    <DashboardShell role={profile.role} title="Office orders">
      <Card>
        {!orders?.length ? (
          <EmptyState message="No orders for your office yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="py-2 pr-4">Employee</th>
                  <th className="py-2 pr-4">Restaurant</th>
                  <th className="py-2 pr-4">Total</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-100">
                    <td className="py-3 pr-4">
                      {(order.profiles as { full_name: string } | null)?.full_name}
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
