import { DashboardShell } from "@/components/DashboardShell";
import { Card } from "@/components/ui";
import { ScheduleCalendar } from "@/components/admin/ScheduleCalendar";
import { WeeklyTemplateAdmin } from "@/components/admin/WeeklyTemplateAdmin";
import { requireAdmin } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

export default async function AdminSchedulesPage() {
  const profile = await requireAdmin();
  const supabase = await createClient();

  const [{ data: offices }, { data: restaurants }, { data: schedules }, { data: templates }] =
    await Promise.all([
      supabase.from("offices").select("*").order("name"),
      supabase.from("restaurants").select("*").order("name"),
      supabase
        .from("daily_lunch_schedules")
        .select("*, restaurants(name), offices(name)")
        .gte("lunch_date", new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10))
        .lte("lunch_date", new Date(Date.now() + 21 * 86400000).toISOString().slice(0, 10))
        .order("lunch_date"),
      supabase.from("weekly_schedule_templates").select("*").order("day_of_week"),
    ]);

  return (
    <DashboardShell role={profile.role} title="Lunch calendar">
      <div className="space-y-6">
        <Card title="Two-week calendar">
          <ScheduleCalendar
            offices={offices ?? []}
            restaurants={restaurants ?? []}
            schedules={schedules ?? []}
          />
        </Card>
        <details className="rounded-xl border border-slate-200 bg-white p-4">
          <summary className="cursor-pointer font-medium text-slate-800">
            Advanced: weekly rotation templates
          </summary>
          <div className="mt-4">
            <WeeklyTemplateAdmin
              offices={offices ?? []}
              restaurants={restaurants ?? []}
              templates={templates ?? []}
            />
          </div>
        </details>
      </div>
    </DashboardShell>
  );
}
