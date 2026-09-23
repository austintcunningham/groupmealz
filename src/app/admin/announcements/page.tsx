import { DashboardShell } from "@/components/DashboardShell";
import { Card, EmptyState } from "@/components/ui";
import { LunchAnnouncementForm } from "@/components/admin/LunchAnnouncementForm";
import { SendAnnouncementNowButton } from "@/components/admin/SendAnnouncementNowButton";
import { requireAdmin } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

export default async function AdminAnnouncementsPage() {
  const profile = await requireAdmin();
  const supabase = await createClient();

  const [{ data: offices }, { data: schedules }, { data: announcements }] = await Promise.all([
    supabase.from("offices").select("*").order("name"),
    supabase
      .from("daily_lunch_schedules")
      .select("*, offices(name), restaurants(name)")
      .gte("lunch_date", new Date().toISOString().slice(0, 10))
      .order("lunch_date")
      .limit(30),
    supabase
      .from("lunch_announcements")
      .select("*, offices(name)")
      .order("send_at", { ascending: false })
      .limit(20),
  ]);

  return (
    <DashboardShell role={profile.role} title="Restaurant of the Day emails">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Build & schedule">
          {!offices?.length ? (
            <EmptyState message="Create an office first." />
          ) : (
            <LunchAnnouncementForm offices={offices} schedules={schedules ?? []} />
          )}
        </Card>
        <Card title="Recent announcements">
          {!announcements?.length ? (
            <EmptyState message="None scheduled yet." />
          ) : (
            <ul className="divide-y divide-slate-100 text-sm">
              {announcements.map((a) => (
                <li key={a.id} className="py-3">
                  <p className="font-medium">{a.subject}</p>
                  <p className="text-slate-500">
                    {(a.offices as { name: string } | null)?.name} · {a.status} ·{" "}
                    {new Date(a.send_at).toLocaleString()}
                  </p>
                  {a.status === "scheduled" ? <SendAnnouncementNowButton id={a.id} /> : null}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
      <p className="mt-6 text-xs text-slate-500">
        Cron: GET <code>/api/cron/send-lunch-announcements</code> with{" "}
        <code>Authorization: Bearer CRON_SECRET</code> (Vercel Cron recommended).
      </p>
    </DashboardShell>
  );
}
