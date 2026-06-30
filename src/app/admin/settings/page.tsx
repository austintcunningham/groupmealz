import { DashboardShell } from "@/components/DashboardShell";
import { Card } from "@/components/ui";
import { PlatformSettingsForm } from "@/components/admin/PlatformSettingsForm";
import { requireAdmin } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import type { PlatformSettings } from "@/types/database";

export default async function AdminSettingsPage() {
  const profile = await requireAdmin();
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("platform_settings")
    .select("*")
    .limit(1)
    .single();

  return (
    <DashboardShell role={profile.role} title="Platform settings">
      <Card title="Fees & tax">
        {settings ? (
          <PlatformSettingsForm settings={settings as PlatformSettings} />
        ) : (
          <p className="text-sm text-slate-500">No settings found.</p>
        )}
      </Card>
    </DashboardShell>
  );
}
