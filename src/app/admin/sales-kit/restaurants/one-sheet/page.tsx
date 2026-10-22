import { DashboardShell } from "@/components/DashboardShell";
import { RestaurantPartnerOneSheet } from "@/components/admin/sales-kit/RestaurantPartnerOneSheet";
import { SalesKitToolbar } from "@/components/admin/sales-kit/SalesKitToolbar";
import { requireAdmin } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function AdminRestaurantOneSheetPage() {
  const profile = await requireAdmin();

  return (
    <DashboardShell role={profile.role} title="Restaurant one-sheet">
      <SalesKitToolbar audience="restaurants-one-sheet" />
      <p className="-mt-4 mb-6 text-xs text-slate-500 print:hidden">
        Using <strong>Print…</strong>? In Chrome, open More settings and turn off{" "}
        <strong>Headers and footers</strong> to hide the date, URL, and page number.
      </p>
      <p className="mb-6 max-w-2xl text-sm text-slate-600 print:hidden">
        Leave-behind for owners and GMs — designed to fit <strong>one page</strong>. Use{" "}
        <strong>Download PDF</strong> for a clean file (no browser date, URL, or page numbers). For
        depth (email samples, order preview), use the{" "}
        <a href="/admin/sales-kit/restaurants" className="text-[var(--geaux-red)] hover:underline">
          full restaurant packet
        </a>
        .
      </p>
      <RestaurantPartnerOneSheet />
    </DashboardShell>
  );
}
