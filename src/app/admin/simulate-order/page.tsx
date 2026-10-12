import { DashboardShell } from "@/components/DashboardShell";
import { AdminSimulateOrderPicker } from "@/components/admin/AdminSimulateOrderPicker";
import { Card } from "@/components/ui";
import { requireAdmin } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

export default async function AdminSimulateOrderPickerPage() {
  const profile = await requireAdmin();
  const supabase = await createClient();

  const [{ data: restaurants }, { data: offices }] = await Promise.all([
    supabase.from("restaurants").select("slug, name").eq("active", true).order("name"),
    supabase.from("offices").select("slug, name").eq("active", true).order("name"),
  ]);

  return (
    <DashboardShell role={profile.role} title="Order simulation">
      <div className="mx-auto max-w-lg space-y-4">
        <p className="text-sm text-slate-600">
          Preview the customer order flow (menu, cart, checkout UI) for any restaurant. Checkout is
          disabled in simulation — no charges are created.
        </p>
        <Card title="Choose restaurant & office">
          {restaurants?.length ? (
            <AdminSimulateOrderPicker
              restaurants={restaurants}
              offices={offices ?? []}
              defaultRestaurant={restaurants[0].slug}
              defaultOffice={offices?.[0]?.slug ?? ""}
            />
          ) : (
            <p className="text-sm text-slate-500">Add a restaurant first.</p>
          )}
        </Card>
      </div>
    </DashboardShell>
  );
}
