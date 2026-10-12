import { DashboardShell } from "@/components/DashboardShell";
import { Card } from "@/components/ui";
import { MenuPreview } from "@/components/admin/MenuPreview";
import { RestaurantMenuEditor } from "@/components/restaurant/RestaurantMenuEditor";
import { requireAdmin } from "@/lib/auth/guards";
import { loadMenuItemOptionsForItemIds } from "@/lib/menus/load-item-options";
import { createClient } from "@/lib/supabase/server";

export default async function AdminMenusPage() {
  const profile = await requireAdmin();
  const supabase = await createClient();

  const [{ data: restaurants }, { data: categories }, { data: menuItems }, { data: settings }] =
    await Promise.all([
      supabase.from("restaurants").select("*").order("name"),
      supabase.from("menu_categories").select("*").order("display_order"),
      supabase.from("menu_items").select("*").order("display_order"),
      supabase.from("platform_settings").select("flat_fee_cents").limit(1).maybeSingle(),
    ]);

  const serviceFeePerEntreeCents = settings?.flat_fee_cents ?? 250;
  const itemIds = (menuItems ?? []).map((i) => i.id);
  const menuOptions = itemIds.length
    ? await loadMenuItemOptionsForItemIds(supabase, itemIds)
    : { sizesByMenuItemId: {}, ingredientsByMenuItemId: {} };

  return (
    <DashboardShell role={profile.role} title="Menus">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Build menu (admin can edit any restaurant)">
          <p className="mb-4 text-sm text-slate-600">
            Use <strong>Find a menu item</strong> at the top of this panel to jump to a sub in the
            editor — especially helpful for large menus like Firehouse.
          </p>
          {restaurants?.length ? (
            <RestaurantMenuEditor
              restaurantId={restaurants[0].id}
              restaurantName={restaurants[0].name}
              restaurants={restaurants.map((r) => ({ id: r.id, name: r.name }))}
              categories={categories ?? []}
              menuItems={menuItems ?? []}
              serviceFeePerEntreeCents={serviceFeePerEntreeCents}
              showPlatformFeeHints
              sizesByMenuItemId={menuOptions.sizesByMenuItemId}
              ingredientsByMenuItemId={menuOptions.ingredientsByMenuItemId}
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
            sizesByMenuItemId={menuOptions.sizesByMenuItemId}
            ingredientsByMenuItemId={menuOptions.ingredientsByMenuItemId}
          />
        </Card>
      </div>
    </DashboardShell>
  );
}
