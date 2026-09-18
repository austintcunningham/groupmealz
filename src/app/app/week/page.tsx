import Link from "next/link";
import { DashboardShell } from "@/components/DashboardShell";
import { Badge, Card, EmptyState } from "@/components/ui";
import { isOrderingWindowOpen, formatOrderingWindow } from "@/lib/scheduling/window";
import { requireAuth } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { getRelationName } from "@/lib/supabase/relation";

export default async function WeekPage() {
  const profile = await requireAuth();
  const supabase = await createClient();

  const { data: officeLinks } = await supabase
    .from("office_users")
    .select("office_id")
    .eq("user_id", profile.id);

  const officeIds = officeLinks?.map((l) => l.office_id) ?? [];
  const today = new Date();
  const end = new Date(today);
  end.setDate(end.getDate() + 7);

  let query = supabase
    .from("daily_lunch_schedules")
    .select("*, restaurants(name), offices(name)")
    .gte("lunch_date", today.toISOString().slice(0, 10))
    .lte("lunch_date", end.toISOString().slice(0, 10))
    .order("lunch_date");

  if (officeIds.length) query = query.in("office_id", officeIds);

  const { data: schedules } = await query;

  return (
    <DashboardShell role={profile.role} title="This week's lunches">
      {!schedules?.length ? (
        <EmptyState message="No lunches scheduled this week yet." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {schedules.map((s) => {
            const open = isOrderingWindowOpen(s);
            const isToday = s.lunch_date === today.toISOString().slice(0, 10);
            return (
              <Card key={s.id} className={isToday ? "ring-2 ring-[var(--geaux-yellow)]" : ""}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-red-600">
                      {new Date(s.lunch_date + "T12:00:00").toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
                      {isToday ? " · Today" : ""}
                    </p>
                    <h3 className="text-lg font-bold">{getRelationName(s.restaurants)}</h3>
                    <p className="text-sm text-slate-500">{getRelationName(s.offices)}</p>
                    <p className="mt-2 text-xs text-slate-600">{formatOrderingWindow(s)}</p>
                  </div>
                  <Badge tone={open ? "success" : "default"}>
                    {open ? "Order now" : s.status}
                  </Badge>
                </div>
                {open && isToday ? (
                  <Link
                    href="/app/order"
                    className="mt-4 inline-block rounded-lg bg-[var(--geaux-red)] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[var(--geaux-red-dark)] active:scale-95"
                  >
                    Order lunch →
                  </Link>
                ) : null}
              </Card>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
