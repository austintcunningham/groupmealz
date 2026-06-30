import { DashboardShell } from "@/components/DashboardShell";
import { Card, EmptyState } from "@/components/ui";
import { ScheduleAdmin, ScheduleActionButtons } from "@/components/admin/ScheduleAdmin";
import { requireAdmin } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { getRelationName } from "@/lib/supabase/relation";

export default async function AdminSchedulesPage() {
  const profile = await requireAdmin();
  const supabase = await createClient();

  const [{ data: offices }, { data: restaurants }, { data: schedules }] =
    await Promise.all([
      supabase.from("offices").select("*").order("name"),
      supabase.from("restaurants").select("*").order("name"),
      supabase
        .from("daily_lunch_schedules")
        .select("*, offices(name), restaurants(name)")
        .order("lunch_date", { ascending: false })
        .limit(50),
    ]);

  return (
    <DashboardShell role={profile.role} title="Lunch schedules">
      <div className="space-y-6">
        <Card title="Create schedule">
          <ScheduleAdmin offices={offices ?? []} restaurants={restaurants ?? []} />
        </Card>
        <Card title="Schedules">
          {!schedules?.length ? (
            <EmptyState message="No schedules yet." />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-slate-500">
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">Office</th>
                    <th className="py-2 pr-4">Restaurant</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Cutoff</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((s) => (
                    <tr key={s.id} className="border-b border-slate-100">
                      <td className="py-3 pr-4">{s.lunch_date}</td>
                      <td className="py-3 pr-4">
                        {getRelationName(s.offices)}
                      </td>
                      <td className="py-3 pr-4">
                        {getRelationName(s.restaurants)}
                      </td>
                      <td className="py-3 pr-4 capitalize">{s.status}</td>
                      <td className="py-3 pr-4">
                        {new Date(s.order_cutoff_at).toLocaleString()}
                      </td>
                      <td className="py-3">
                        <ScheduleActionButtons scheduleId={s.id} status={s.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </DashboardShell>
  );
}
