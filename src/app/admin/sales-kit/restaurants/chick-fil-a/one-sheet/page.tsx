import { DashboardShell } from "@/components/DashboardShell";
import { RestaurantPartnerOneSheet } from "@/components/admin/sales-kit/RestaurantPartnerOneSheet";
import { SalesKitToolbar } from "@/components/admin/sales-kit/SalesKitToolbar";
import { requireAdmin } from "@/lib/auth/guards";
import { CHICK_FIL_A_PROSPECT } from "@/lib/sales-kit/restaurant-prospect-variants";

export const dynamic = "force-dynamic";

export default async function AdminChickFilAOneSheetPage() {
  const profile = await requireAdmin();

  return (
    <DashboardShell role={profile.role} title="Chick-fil-A one-sheet">
      <SalesKitToolbar
        audience="restaurants-chick-fil-a-one-sheet"
        oneSheetPdfName={CHICK_FIL_A_PROSPECT.oneSheetPdfName}
      />
      <p className="-mt-4 mb-6 text-xs text-slate-500 print:hidden">
        Using <strong>Print…</strong>? In Chrome, open More settings and turn off{" "}
        <strong>Headers and footers</strong> to hide the date, URL, and page number.
      </p>
      <p className="mb-6 max-w-2xl text-sm text-slate-600 print:hidden">
        Leave-behind tailored for <strong>Chick-fil-A operators</strong> — corporate catering and
        high-volume office rotation. Use <strong>Download PDF</strong> for a clean file. Full detail:{" "}
        <a
          href="/admin/sales-kit/restaurants/chick-fil-a"
          className="text-[var(--geaux-red)] hover:underline"
        >
          Chick-fil-A partner packet
        </a>
        .
      </p>
      <RestaurantPartnerOneSheet prospectId="chick-fil-a" />
    </DashboardShell>
  );
}
