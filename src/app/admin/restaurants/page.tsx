import { DashboardShell } from "@/components/DashboardShell";
import { Card, EmptyState } from "@/components/ui";
import { CreateRestaurantForm } from "@/components/admin/CreateRestaurantForm";
import { AssignRestaurantManagerForm } from "@/components/admin/AssignRestaurantManagerForm";
import { RestaurantBrandingForm } from "@/components/admin/RestaurantBrandingForm";
import type { Restaurant } from "@/types/database";
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
                <li key={r.id} className="border-b border-slate-100 py-4 last:border-0">
                  <p className="font-medium">{r.name}</p>
                  <p className="text-sm text-slate-500">{r.slug}</p>
                  <p className="text-xs text-slate-400">
                    {r.city}, {r.state} · {r.active ? "Active" : "Inactive"}
                  </p>
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm text-[var(--geaux-red)]">
                      Branding & approval
                    </summary>
                    <div className="mt-2">
                      <RestaurantBrandingForm restaurant={r as Restaurant} isAdmin />
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </DashboardShell>
  );
}
