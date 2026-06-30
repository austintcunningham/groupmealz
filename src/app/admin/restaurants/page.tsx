import { DashboardShell } from "@/components/DashboardShell";
import { Card, EmptyState } from "@/components/ui";
import { CreateRestaurantForm } from "@/components/admin/CreateRestaurantForm";
import { AssignRestaurantManagerForm } from "@/components/admin/AssignRestaurantManagerForm";
import { requireAdmin } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

export default async function AdminRestaurantsPage() {
  const profile = await requireAdmin();
  const supabase = await createClient();
  const { data: restaurants } = await supabase
    .from("restaurants")
    .select("*")
    .order("name");

  return (
    <DashboardShell role={profile.role} title="Restaurants">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Create restaurant">
          <CreateRestaurantForm />
          <AssignRestaurantManagerForm restaurants={restaurants ?? []} />
        </Card>
        <Card title="All restaurants">
          {!restaurants?.length ? (
            <EmptyState message="No restaurants yet." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {restaurants.map((r) => (
                <li key={r.id} className="py-3">
                  <p className="font-medium">{r.name}</p>
                  <p className="text-sm text-slate-500">{r.slug}</p>
                  <p className="text-xs text-slate-400">
                    {r.city}, {r.state} · {r.active ? "Active" : "Inactive"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </DashboardShell>
  );
}
