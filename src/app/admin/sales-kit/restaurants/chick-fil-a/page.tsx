import { DashboardShell } from "@/components/DashboardShell";
import { RestaurantSalesPacket } from "@/components/admin/sales-kit/RestaurantSalesPacket";
import { SalesKitToolbar } from "@/components/admin/sales-kit/SalesKitToolbar";
import { requireAdmin } from "@/lib/auth/guards";
import { CHICK_FIL_A_ORDER_PREVIEW } from "@/lib/sales-kit/order-preview-sample";

export const dynamic = "force-dynamic";

export default async function AdminChickFilARestaurantSalesKitPage() {
  const profile = await requireAdmin();

  return (
    <DashboardShell role={profile.role} title="Chick-fil-A partner packet">
      <SalesKitToolbar audience="restaurants-chick-fil-a" />
      <p className="-mt-4 mb-6 max-w-2xl text-sm text-slate-600 print:hidden">
        Target-account materials — elevated volume assumptions and{" "}
        <strong>catering-forward positioning</strong> for high-throughput operators. Not for general
        prospecting; use the{" "}
        <a href="/admin/sales-kit/restaurants" className="text-[var(--geaux-red)] hover:underline">
          standard restaurant packet
        </a>{" "}
        for other brands.
      </p>
      <RestaurantSalesPacket orderPreview={CHICK_FIL_A_ORDER_PREVIEW} prospectId="chick-fil-a" />
    </DashboardShell>
  );
}
