import { DashboardShell } from "@/components/DashboardShell";
import { Card } from "@/components/ui";
import { InvitePlatformAdminForm } from "@/components/admin/InvitePlatformAdminForm";
import { PendingStaffInvitations } from "@/components/admin/PendingStaffInvitations";
import { PlatformSettingsForm } from "@/components/admin/PlatformSettingsForm";
import { requireAdmin } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import type { PlatformSettings, StaffInvitation } from "@/types/database";

export default async function AdminSettingsPage() {
  const profile = await requireAdmin();
  const supabase = await createClient();
  const [{ data: settings }, { data: pending }] = await Promise.all([
    supabase.from("platform_settings").select("*").limit(1).single(),
    supabase
      .from("staff_invitations")
      .select("*, offices(name), restaurants(name)")
      .order("created_at", { ascending: false }),
  ]);

  return (
    <DashboardShell role={profile.role} title="Platform settings">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Fees & tax">
          {settings ? (
            <PlatformSettingsForm settings={settings as PlatformSettings} />
          ) : (
            <p className="text-sm text-slate-500">No settings found.</p>
          )}
        </Card>
        <div className="space-y-6">
          <Card title="Platform admins">
            <InvitePlatformAdminForm />
          </Card>
          <Card title="Pending staff invites">
            <p className="mb-4 text-sm text-slate-600">
              These people can sign up at <strong>/signup</strong> with the listed email; roles and
              office/restaurant links apply automatically.
            </p>
            <PendingStaffInvitations
              rows={(pending ?? []) as (StaffInvitation & {
                offices: { name: string } | null;
                restaurants: { name: string } | null;
              })[]}
            />
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
