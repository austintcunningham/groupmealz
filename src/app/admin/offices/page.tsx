import { DashboardShell } from "@/components/DashboardShell";
import { Card, EmptyState, ErrorMessage } from "@/components/ui";
import { CreateOfficeForm } from "@/components/admin/CreateOfficeForm";
import { AssignOfficeUserForm } from "@/components/admin/AssignOfficeUserForm";
import { EnsureOfficeSlugsButton } from "@/components/admin/EnsureOfficeSlugsButton";
import { OfficeOrderLinks } from "@/components/admin/OfficeOrderLinks";
import { requireAdmin } from "@/lib/auth/guards";
import { loadOfficesForAdminPage } from "@/lib/offices/load-admin-offices";

export default async function AdminOfficesPage() {
  const profile = await requireAdmin();
  const { offices, loadError, slugColumnMissing } = await loadOfficesForAdminPage();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const officesWithSlugs = offices.filter((o) => o.slug?.trim());
  const needsSlugs =
    !slugColumnMissing && offices.length > 0 && officesWithSlugs.length < offices.length;

  return (
    <DashboardShell role={profile.role} title="Offices">
      {loadError ? (
        <div className="mb-6">
          <ErrorMessage message={`Could not load offices: ${loadError}`} />
        </div>
      ) : null}

      {slugColumnMissing ? (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Guest order links need database migration{" "}
          <code className="text-xs">003_guest_orders_office_slug.sql</code>. Run it in Supabase →
          SQL Editor, then refresh this page.
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Create office">
          <CreateOfficeForm />
          <details className="mt-6">
            <summary className="cursor-pointer text-sm text-slate-600">Optional: staff logins</summary>
            <div className="mt-3">
              <AssignOfficeUserForm offices={offices} />
            </div>
          </details>
        </Card>
        <Card title="Order links (share with employees)">
          <p className="mb-4 text-sm text-slate-600">
            Employees use this link — no signup. Same flow as Major Menus.
          </p>
          {needsSlugs ? (
            <div className="mb-4">
              <p className="mb-2 text-sm text-slate-600">
                Some offices are missing order-link slugs.
              </p>
              <EnsureOfficeSlugsButton />
            </div>
          ) : null}
          {!offices.length ? (
            <EmptyState message="No offices yet." />
          ) : slugColumnMissing ? (
            <EmptyState message="Apply migration 003 to enable order links." />
          ) : !officesWithSlugs.length ? (
            <EnsureOfficeSlugsButton />
          ) : (
            <OfficeOrderLinks offices={officesWithSlugs} appUrl={appUrl} />
          )}
        </Card>
      </div>
    </DashboardShell>
  );
}
