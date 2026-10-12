import { DashboardShell } from "@/components/DashboardShell";
import { Card } from "@/components/ui";
import { MenuPreview } from "@/components/admin/MenuPreview";
import { RestaurantMenuEditor } from "@/components/restaurant/RestaurantMenuEditor";
import { requireAdmin } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

export default async function AdminMenusPage() {
  const profile = await requireAdmin();
  const supabase = await createClient();

  const [{ data: restaurants }, { data: categories }, { data: menuItems }] =
    await Promise.all([
      supabase.from("restaurants").select("*").order("name"),
      supabase.from("menu_categories").select("*").order("display_order"),
      supabase.from("menu_items").select("*").order("display_order"),
    ]);

  return (
    <DashboardShell role={profile.role} title="Menus">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Build menu">
          {restaurants?.length ? (
            <RestaurantMenuEditor
              restaurantId={restaurants[0].id}
              restaurantName={restaurants[0].name}
              restaurants={restaurants.map((r) => ({ id: r.id, name: r.name }))}
              categories={categories ?? []}
              menuItems={menuItems ?? []}
            />
          ) : (
            <p className="text-sm text-slate-500">Create a restaurant first.</p>
          )}
        </Card>
        <Card title="Menu preview">
          <MenuPreview
            restaurants={restaurants ?? []}
            categories={categories ?? []}
            menuItems={menuItems ?? []}
          />
        </Card>
      </div>
    </DashboardShell>
  );
}
