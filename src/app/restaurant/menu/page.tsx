import { DashboardShell } from "@/components/DashboardShell";
import { Card, EmptyState } from "@/components/ui";
import { requireRestaurantManager } from "@/lib/auth/guards";
import { formatCents } from "@/lib/money/format";
import { createClient } from "@/lib/supabase/server";
import { getRelationName } from "@/lib/supabase/relation";

export default async function RestaurantMenuPage() {
  const profile = await requireRestaurantManager();
  const supabase = await createClient();

  const { data: links } = await supabase
    .from("restaurant_users")
    .select("restaurant_id, restaurants(name)")
    .eq("user_id", profile.id);

  const restaurantId = links?.[0]?.restaurant_id;
  const { data: items } = restaurantId
    ? await supabase
        .from("menu_items")
        .select("*, menu_categories(name)")
        .eq("restaurant_id", restaurantId)
        .order("display_order")
    : { data: [] };

  return (
    <DashboardShell role={profile.role} title="Menu">
      <Card title={getRelationName(links?.[0]?.restaurants) ?? "Menu"}>
        {!items?.length ? (
          <EmptyState message="No menu items." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between py-3 text-sm">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-slate-500">
                    {getRelationName(item.menu_categories) ?? "Uncategorized"}
                  </p>
                </div>
                <span>{formatCents(item.price_cents)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </DashboardShell>
  );
}
