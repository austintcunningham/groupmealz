import { DashboardShell } from "@/components/DashboardShell";
import { RestaurantPartnerOneSheet } from "@/components/admin/sales-kit/RestaurantPartnerOneSheet";
import { SalesKitToolbar } from "@/components/admin/sales-kit/SalesKitToolbar";
import { requireAdmin } from "@/lib/auth/guards";

export default async function AdminRestaurantOneSheetPage() {
  const profile = await requireAdmin();

  return (
    <DashboardShell role={profile.role} title="Restaurant one-sheet">
      <SalesKitToolbar audience="restaurants-one-sheet" />
      <p className="mb-6 max-w-2xl text-sm text-slate-600 print:hidden">
        Leave-behind for owners and GMs — designed to fit <strong>one printed page</strong>. Use Print
        / Save PDF and hand it off at a site visit or attach to a intro email. For depth (playbook,
        email samples), use the{" "}
        <a href="/admin/sales-kit/restaurants" className="text-[var(--geaux-red)] hover:underline">
          full restaurant packet
        </a>
        .
      </p>
      <RestaurantPartnerOneSheet />
    </DashboardShell>
  );
}
