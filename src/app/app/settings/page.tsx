import { DashboardShell } from "@/components/DashboardShell";
import { SavedPaymentMethods } from "@/components/employee/SavedPaymentMethods";
import { Card } from "@/components/ui";
import { getSavedPaymentMethods } from "@/lib/actions/orders";
import { requireEmployee } from "@/lib/auth/guards";

export default async function EmployeeSettingsPage() {
  const profile = await requireEmployee();
  const savedMethods = await getSavedPaymentMethods();

  return (
    <DashboardShell role={profile.role} title="Settings">
      <div className="space-y-6">
        <Card title="Profile">
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-slate-500">Name</dt>
              <dd className="font-medium">{profile.full_name || "—"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Email</dt>
              <dd className="font-medium">{profile.email}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Role</dt>
              <dd className="font-medium capitalize">{profile.role}</dd>
            </div>
          </dl>
        </Card>
        <SavedPaymentMethods methods={savedMethods} />
      </div>
    </DashboardShell>
  );
}
