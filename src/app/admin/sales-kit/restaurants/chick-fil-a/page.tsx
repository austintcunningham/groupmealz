import { DashboardShell } from "@/components/DashboardShell";
import { RestaurantSalesPacket } from "@/components/admin/sales-kit/RestaurantSalesPacket";
import { SalesKitToolbar } from "@/components/admin/sales-kit/SalesKitToolbar";
import { requireAdmin } from "@/lib/auth/guards";
import { loadSalesKitOrderPreviewSample } from "@/lib/sales-kit/order-preview-sample";

export const dynamic = "force-dynamic";

export default async function AdminChickFilARestaurantSalesKitPage() {
  const profile = await requireAdmin();
  const orderPreview = await loadSalesKitOrderPreviewSample();

  return (
    <DashboardShell role={profile.role} title="Restaurant sales packet (higher volume)">
      <SalesKitToolbar audience="restaurants-chick-fil-a" />
      <p className="-mt-4 mb-6 max-w-2xl text-sm text-slate-600 print:hidden">
        Same restaurant partner packet as{" "}
        <a href="/admin/sales-kit/restaurants" className="text-[var(--geaux-red)] hover:underline">
          the standard deck
        </a>
        — Firehouse examples throughout — with higher illustrative order volumes only.
      </p>
      <RestaurantSalesPacket orderPreview={orderPreview} prospectId="chick-fil-a" />
    </DashboardShell>
  );
}
