import { DashboardShell } from "@/components/DashboardShell";
import { OfficeSalesPacket } from "@/components/admin/sales-kit/OfficeSalesPacket";
import { SalesKitToolbar } from "@/components/admin/sales-kit/SalesKitToolbar";
import { requireAdmin } from "@/lib/auth/guards";

export default async function AdminOfficeSalesKitPage() {
  const profile = await requireAdmin();
  const appBase = (process.env.NEXT_PUBLIC_APP_URL ?? "https://www.groupmeals.net").replace(
    /\/$/,
    ""
  );

  return (
    <DashboardShell role={profile.role} title="Office sales packet">
      <SalesKitToolbar audience="offices" />
      <OfficeSalesPacket appBase={appBase} />
    </DashboardShell>
  );
}
