import Link from "next/link";
import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/DashboardShell";
import { OrderPaySection } from "@/components/employee/OrderPaySection";
import { OrderReviewSection } from "@/components/reviews/OrderReviewSection";
import { Badge, Card } from "@/components/ui";
import { requireAuth } from "@/lib/auth/guards";
import { formatCents } from "@/lib/money/format";
import { createClient } from "@/lib/supabase/server";
import { getRelationName } from "@/lib/supabase/relation";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireAuth();
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*), restaurants(name), offices(name)")
    .eq("id", id)
    .single();

  if (!order) notFound();

  if (
    profile.role !== "admin" &&
    profile.role !== "office_admin" &&
    order.user_id !== profile.id
  ) {
    notFound();
  }

  return (
    <DashboardShell role={profile.role} title="Order details">
      <div className="space-y-6">
        <Card>
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone={order.status === "paid" ? "success" : "default"}>
              {order.status}
            </Badge>
            <span className="text-sm text-slate-500">
              {new Date(order.created_at).toLocaleString()}
            </span>
          </div>
          <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <p>
              <span className="text-slate-500">Restaurant:</span>{" "}
              {getRelationName(order.restaurants)}
            </p>
            <p>
              <span className="text-slate-500">Office:</span>{" "}
              {getRelationName(order.offices)}
            </p>
            <p>
              <span className="text-slate-500">Customer:</span> {order.customer_name}
            </p>
            <p>
              <span className="text-slate-500">Email:</span> {order.customer_email}
            </p>
          </div>
        </Card>

        <Card title="Items">
          <ul className="divide-y divide-slate-100">
            {(order.order_items ?? []).map((item: {
              id: string;
              quantity: number;
              item_name_snapshot: string;
              line_total_cents: number;
              special_instructions: string | null;
            }) => (
              <li key={item.id} className="flex justify-between py-3 text-sm">
                <div>
                  <p>
                    {item.quantity}× {item.item_name_snapshot}
                  </p>
                  {item.special_instructions ? (
                    <p className="text-slate-500">{item.special_instructions}</p>
                  ) : null}
                </div>
                <span>{formatCents(item.line_total_cents)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1 border-t pt-4 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCents(order.subtotal_cents)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>{formatCents(order.tax_cents)}</span>
            </div>
            <div className="flex justify-between">
              <span>Platform fee</span>
              <span>{formatCents(order.platform_fee_cents)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatCents(order.total_cents)}</span>
            </div>
          </div>
        </Card>

        {order.status === "pending_payment" && order.user_id === profile.id ? (
          <OrderPaySection orderId={order.id} />
        ) : null}

        {order.status === "paid" && order.user_id === profile.id ? (
          <OrderReviewSection orderId={order.id} />
        ) : null}

        <Link href="/app/orders" className="text-sm text-red-600 hover:underline">
          ← Back to orders
        </Link>
      </div>
    </DashboardShell>
  );
}
