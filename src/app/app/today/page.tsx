import { DashboardShell } from "@/components/DashboardShell";
import { EmptyState } from "@/components/ui";
import { TodayOrderClient } from "@/components/employee/TodayOrderClient";
import { requireEmployee } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

export default async function TodayOrderPage() {
  const profile = await requireEmployee();
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: officeLinks } = await supabase
    .from("office_users")
    .select("office_id")
    .eq("user_id", profile.id);

  const officeIds = officeLinks?.map((l) => l.office_id) ?? [];

  let scheduleQuery = supabase
    .from("daily_lunch_schedules")
    .select("*, restaurants(*)")
    .eq("lunch_date", today)
    .in("status", ["open", "closed", "sent_to_restaurant"]);

  if (officeIds.length > 0) {
    scheduleQuery = scheduleQuery.in("office_id", officeIds);
  }

  const { data: schedule } = await scheduleQuery.maybeSingle();

  if (!schedule) {
    return (
      <DashboardShell role={profile.role} title="Order today">
        <EmptyState message="No lunch scheduled for your office today." />
      </DashboardShell>
    );
  }

  const { data: categories } = await supabase
    .from("menu_categories")
    .select("*")
    .eq("restaurant_id", schedule.restaurant_id)
    .eq("active", true)
    .order("display_order");

  const { data: menuItems } = await supabase
    .from("menu_items")
    .select("*")
    .eq("restaurant_id", schedule.restaurant_id)
    .eq("active", true)
    .eq("available", true)
    .order("display_order");

  return (
    <DashboardShell role={profile.role} title="Order today">
      <TodayOrderClient
        schedule={schedule}
        categories={categories ?? []}
        menuItems={menuItems ?? []}
      />
    </DashboardShell>
  );
}
