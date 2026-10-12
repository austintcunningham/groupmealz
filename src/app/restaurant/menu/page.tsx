import Link from "next/link";
import { DashboardShell } from "@/components/DashboardShell";
import { EmptyState } from "@/components/ui";
import { RestaurantMenuEditor } from "@/components/restaurant/RestaurantMenuEditor";
import { requireRestaurantManager } from "@/lib/auth/guards";
import { loadMenuItemOptionsForItemIds } from "@/lib/menus/load-item-options";
import { createClient } from "@/lib/supabase/server";
import type { MenuCategory, MenuItem } from "@/types/database";

export default async function RestaurantMenuPage() {
  const profile = await requireRestaurantManager();
  const supabase = await createClient();

  const { data: links } = await supabase
    .from("restaurant_users")
    .select("restaurant_id, restaurants(id, name)")
    .eq("user_id", profile.id);

  let restaurants: { id: string; name: string }[] =
    profile.role === "admin"
      ? ((await supabase.from("restaurants").select("id, name").order("name")).data ?? [])
      : (links ?? []).map((l) => {
          const r = l.restaurants as { id: string; name: string } | { id: string; name: string }[] | null;
          const row = Array.isArray(r) ? r[0] : r;
          return row ? { id: row.id, name: row.name } : null;
        }).filter(Boolean) as { id: string; name: string }[];

  const restaurantId = restaurants[0]?.id;
  const restaurantIds = restaurants.map((r) => r.id);

  const isAdmin = profile.role === "admin";

  const [{ data: categories }, { data: menuItems }, { data: settings }] = restaurantId
    ? await Promise.all([
        supabase
          .from("menu_categories")
          .select("*")
          .in("restaurant_id", restaurantIds)
          .order("display_order"),
        supabase
          .from("menu_items")
          .select("*")
          .in("restaurant_id", restaurantIds)
          .order("display_order"),
        isAdmin
          ? supabase.from("platform_settings").select("flat_fee_cents").limit(1).maybeSingle()
          : Promise.resolve({ data: null }),
      ])
    : [{ data: [] }, { data: [] }, { data: null }];

  if (!restaurantId) {
    return (
      <DashboardShell role={profile.role} title="Menu">
        <EmptyState message="No restaurant assigned." />
      </DashboardShell>
    );
  }

  const name = restaurants.find((r) => r.id === restaurantId)?.name ?? "Menu";
  const itemIds = (menuItems ?? []).map((i) => i.id);
  const menuOptions = itemIds.length
    ? await loadMenuItemOptionsForItemIds(supabase, itemIds)
    : { sizesByMenuItemId: {}, ingredientsByMenuItemId: {} };

  return (
    <DashboardShell role={profile.role} title="Menu">
      {profile.role === "admin" && restaurants.length > 1 ? (
        <p className="mb-4 text-sm text-slate-600">
          Also see <Link href="/admin/menus" className="text-[var(--geaux-red)] hover:underline">Admin → Menus</Link> for all restaurants.
        </p>
      ) : null}
      <RestaurantMenuEditor
          restaurantId={restaurantId}
          restaurantName={name}
          categories={(categories ?? []) as MenuCategory[]}
          menuItems={(menuItems ?? []) as MenuItem[]}
          restaurants={restaurants.length > 1 ? restaurants : undefined}
          showPlatformFeeHints={isAdmin}
          serviceFeePerEntreeCents={isAdmin ? (settings?.flat_fee_cents ?? 250) : undefined}
          sizesByMenuItemId={menuOptions.sizesByMenuItemId}
          ingredientsByMenuItemId={menuOptions.ingredientsByMenuItemId}
        />
    </DashboardShell>
  );
}
