import { DashboardShell } from "@/components/DashboardShell";
import { Card, EmptyState } from "@/components/ui";
import { requireOfficeAdmin } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { getRelationName } from "@/lib/supabase/relation";

export default async function OfficeDashboardPage() {
  const profile = await requireOfficeAdmin();
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: officeLinks } = await supabase
    .from("office_users")
    .select("office_id, offices(*)")
    .eq("user_id", profile.id);

  const officeIds = officeLinks?.map((l) => l.office_id) ?? [];

  const { data: schedules } = officeIds.length
    ? await supabase
        .from("daily_lunch_schedules")
        .select("*, restaurants(name)")
        .in("office_id", officeIds)
        .eq("lunch_date", today)
    : { data: [] };

  const { count: employeeCount } = officeIds.length
    ? await supabase
        .from("office_users")
        .select("*", { count: "exact", head: true })
        .in("office_id", officeIds)
    : { count: 0 };

  const { count: orderCount } = officeIds.length
    ? await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .in("office_id", officeIds)
        .eq("status", "paid")
    : { count: 0 };

  return (
    <DashboardShell role={profile.role} title="Office dashboard">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Offices" value={String(officeLinks?.length ?? 0)} />
          <Stat label="Employees" value={String(employeeCount ?? 0)} />
          <Stat label="Paid orders" value={String(orderCount ?? 0)} />
        </div>
        <Card title="Today's lunch">
          {!schedules?.length ? (
            <EmptyState message="No lunch scheduled today." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {schedules.map((s) => (
                <li key={s.id} className="py-3 text-sm">
                  <p className="font-medium">
                    {getRelationName(s.restaurants)}
                  </p>
                  <p className="text-slate-500 capitalize">{s.status}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </DashboardShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}
