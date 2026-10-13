import { DashboardShell } from "@/components/DashboardShell";
import { RestaurantSalesPacket } from "@/components/admin/sales-kit/RestaurantSalesPacket";
import { SalesKitToolbar } from "@/components/admin/sales-kit/SalesKitToolbar";
import { requireAdmin } from "@/lib/auth/guards";

export default async function AdminRestaurantSalesKitPage() {
  const profile = await requireAdmin();

  return (
    <DashboardShell role={profile.role} title="Restaurant sales packet">
      <SalesKitToolbar audience="restaurants" />
      <RestaurantSalesPacket />
    </DashboardShell>
  );
}
