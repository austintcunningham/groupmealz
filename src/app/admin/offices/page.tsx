import { DashboardShell } from "@/components/DashboardShell";
import { Card, EmptyState } from "@/components/ui";
import { CreateOfficeForm } from "@/components/admin/CreateOfficeForm";
import { AssignOfficeUserForm } from "@/components/admin/AssignOfficeUserForm";
import { requireAdmin } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

export default async function AdminOfficesPage() {
  const profile = await requireAdmin();
  const supabase = await createClient();
  const { data: offices } = await supabase.from("offices").select("*").order("name");

  return (
    <DashboardShell role={profile.role} title="Offices">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Create office">
          <CreateOfficeForm />
          <AssignOfficeUserForm offices={offices ?? []} />
        </Card>
        <Card title="All offices">
          {!offices?.length ? (
            <EmptyState message="No offices yet." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {offices.map((o) => (
                <li key={o.id} className="py-3">
                  <p className="font-medium">{o.name}</p>
                  <p className="text-sm text-slate-500">{o.company_name}</p>
                  <p className="text-xs text-slate-400">
                    {o.street_address}, {o.city}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </DashboardShell>
  );
}
