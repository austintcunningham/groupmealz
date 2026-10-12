import Link from "next/link";
import { DashboardShell } from "@/components/DashboardShell";
import { Card } from "@/components/ui";
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
      <div className="mx-auto max-w-4xl space-y-4">
        <p className="text-sm text-slate-600">
          Edit any restaurant&apos;s menu. The <strong>customer view</strong> preview and{" "}
          <strong>Find a menu item</strong> search are at the top of the editor. For a full-screen
          order flow preview, use{" "}
          <Link href="/admin/simulate-order/fhs-g" className="font-medium text-[var(--geaux-red)] hover:underline">
            order simulation
          </Link>
          .
        </p>
        <Card title="Menu editor">
          {!restaurants?.length ? (
            <p className="text-sm text-slate-500">Create a restaurant first.</p>
          ) : (
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
          )}
        </Card>
      </div>
    </DashboardShell>
  );
}
