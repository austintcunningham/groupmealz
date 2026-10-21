import { DashboardShell } from "@/components/DashboardShell";
import { RestaurantSalesPacket } from "@/components/admin/sales-kit/RestaurantSalesPacket";
import { SalesKitToolbar } from "@/components/admin/sales-kit/SalesKitToolbar";
import { requireAdmin } from "@/lib/auth/guards";
import { loadSalesKitOrderPreviewSample } from "@/lib/sales-kit/order-preview-sample";

export const dynamic = "force-dynamic";

export default async function AdminRestaurantSalesKitPage() {
  const profile = await requireAdmin();
  const orderPreview = await loadSalesKitOrderPreviewSample();

  return (
    <DashboardShell role={profile.role} title="Restaurant sales packet">
      <SalesKitToolbar audience="restaurants" />
      <RestaurantSalesPacket orderPreview={orderPreview} />
    </DashboardShell>
  );
}
