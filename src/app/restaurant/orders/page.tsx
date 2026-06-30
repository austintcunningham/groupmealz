import { DashboardShell } from "@/components/DashboardShell";
import { Badge, Card, EmptyState } from "@/components/ui";
import { requireRestaurantManager } from "@/lib/auth/guards";
import { formatCents } from "@/lib/money/format";
import { createClient } from "@/lib/supabase/server";
import { getRelationName } from "@/lib/supabase/relation";

export default async function RestaurantOrdersPage() {
  const profile = await requireRestaurantManager();
  const supabase = await createClient();

  const { data: links } = await supabase
    .from("restaurant_users")
    .select("restaurant_id")
    .eq("user_id", profile.id);

  const restaurantIds = links?.map((l) => l.restaurant_id) ?? [];

  let query = supabase
    .from("orders")
    .select("*, offices(name)")
    .eq("status", "paid")
    .order("created_at", { ascending: false });

  if (profile.role !== "admin" && restaurantIds.length > 0) {
    query = query.in("restaurant_id", restaurantIds);
  }

  const { data: orders } = await query.limit(50);

  return (
    <DashboardShell role={profile.role} title="Paid orders">
      <Card>
        {!orders?.length ? (
          <EmptyState message="No paid orders yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="py-2 pr-4">Customer</th>
                  <th className="py-2 pr-4">Office</th>
                  <th className="py-2 pr-4">Total</th>
                  <th className="py-2">Payout (reporting)</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-100">
                    <td className="py-3 pr-4">{order.customer_name}</td>
                    <td className="py-3 pr-4">
                      {getRelationName(order.offices)}
                    </td>
                    <td className="py-3 pr-4">{formatCents(order.total_cents)}</td>
                    <td className="py-3">
                      <Badge tone="success">{formatCents(order.payout_due_cents)}</Badge>
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
