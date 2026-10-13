import Link from "next/link";
import { DashboardShell } from "@/components/DashboardShell";
import { Card, EmptyState } from "@/components/ui";
import { CreateRestaurantForm } from "@/components/admin/CreateRestaurantForm";
import { EditRestaurantContactForm } from "@/components/admin/EditRestaurantContactForm";
import { AssignRestaurantManagerForm } from "@/components/admin/AssignRestaurantManagerForm";
import { RestaurantBrandingPanel } from "@/components/restaurant/RestaurantBrandingPanel";
import { requireAdmin } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import type { Restaurant } from "@/types/database";

export default async function AdminRestaurantsPage() {
  const profile = await requireAdmin();
  const supabase = await createClient();
  const { data: restaurants } = await supabase
    .from("restaurants")
    .select("*")
    .order("name");

  return (
    <DashboardShell role={profile.role} title="Restaurants">
      <p className="mb-4 text-sm text-slate-600">
        Upload logo and banner files per restaurant below, or use{" "}
        <Link href="/admin/branding" className="font-medium text-[var(--geaux-red)] hover:underline">
          Branding review
        </Link>{" "}
        for pending manager submissions.
      </p>
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
                    {r.email ? ` · ${r.email}` : " · No email on file"}
                  </p>
                  <EditRestaurantContactForm
                    restaurantId={r.id}
                    name={r.name}
                    email={r.email}
                    phone={r.phone}
                  />
                  <details className="mt-3 rounded-lg border border-slate-200 bg-slate-50/50">
                    <summary className="cursor-pointer px-3 py-2 text-sm font-medium text-[var(--geaux-red)]">
                      Branding — upload logo &amp; banner
                    </summary>
                    <div className="border-t border-slate-200 bg-white p-3">
                      <RestaurantBrandingPanel restaurant={r as Restaurant} isAdmin />
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
