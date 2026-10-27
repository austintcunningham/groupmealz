import { DashboardShell } from "@/components/DashboardShell";
import { OfficeCustomerOneSheet } from "@/components/admin/sales-kit/OfficeCustomerOneSheet";
import { SalesKitToolbar } from "@/components/admin/sales-kit/SalesKitToolbar";
import { requireAdmin } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function AdminOfficeOneSheetPage() {
  const profile = await requireAdmin();

  return (
    <DashboardShell role={profile.role} title="Office one-sheet">
      <SalesKitToolbar
        audience="offices-one-sheet"
        oneSheetPdfName="groupmeals-office-one-sheet.pdf"
      />
      <p className="-mt-4 mb-6 text-xs text-slate-500 print:hidden">
        Using <strong>Print…</strong>? In Chrome, open More settings and turn off{" "}
        <strong>Headers and footers</strong> to hide the date, URL, and page number.
      </p>
      <p className="mb-6 max-w-2xl text-sm text-slate-600 print:hidden">
        Leave-behind for office leaders and admins — designed to fit <strong>one page</strong>. Use{" "}
        <strong>Download PDF</strong> for a clean file. For email samples and more depth, use the{" "}
        <a href="/admin/sales-kit/offices" className="text-[var(--geaux-red)] hover:underline">
          full office packet
        </a>
        .
      </p>
      <OfficeCustomerOneSheet />
    </DashboardShell>
  );
}
