import { DashboardShell } from "@/components/DashboardShell";
import { Card, EmptyState } from "@/components/ui";
import { CreateOfficeForm } from "@/components/admin/CreateOfficeForm";
import { AssignOfficeUserForm } from "@/components/admin/AssignOfficeUserForm";
import { OfficeOrderLinks } from "@/components/admin/OfficeOrderLinks";
import { requireAdmin } from "@/lib/auth/guards";
import { ensureOfficeSlugs } from "@/lib/actions/offices";
import { createClient } from "@/lib/supabase/server";

export default async function AdminOfficesPage() {
  const profile = await requireAdmin();
  const supabase = await createClient();
  let { data: offices } = await supabase.from("offices").select("*").order("name");

  if (offices?.some((o) => !o.slug)) {
    await ensureOfficeSlugs();
    const refreshed = await supabase.from("offices").select("*").order("name");
    offices = refreshed.data;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <DashboardShell role={profile.role} title="Offices">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Create office">
          <CreateOfficeForm />
          <details className="mt-6">
            <summary className="cursor-pointer text-sm text-slate-600">Optional: staff logins</summary>
            <div className="mt-3">
              <AssignOfficeUserForm offices={offices ?? []} />
            </div>
          </details>
        </Card>
        <Card title="Order links (share with employees)">
          <p className="mb-4 text-sm text-slate-600">
            Employees use this link — no signup. Same flow as Major Menus.
          </p>
          {!offices?.length ? (
            <EmptyState message="No offices yet." />
          ) : (
            <OfficeOrderLinks offices={offices} appUrl={appUrl} />
          )}
        </Card>
      </div>
    </DashboardShell>
  );
}
