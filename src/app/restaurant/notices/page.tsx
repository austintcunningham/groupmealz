import { DashboardShell } from "@/components/DashboardShell";
import { Card, EmptyState } from "@/components/ui";
import { RestaurantNoticesPanel } from "@/components/restaurant/RestaurantNoticesPanel";
import { requireRestaurantManager } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Restaurant, RestaurantNotice } from "@/types/database";

export default async function RestaurantNoticesPage() {
  const profile = await requireRestaurantManager();
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: links } = await supabase
    .from("restaurant_users")
    .select("restaurant_id, restaurants(*)")
    .eq("user_id", profile.id);

  const restaurant =
    profile.role === "admin"
      ? ((await admin.from("restaurants").select("*").order("name").limit(1)).data?.[0] as
          | Restaurant
          | undefined)
      : (() => {
          const r = links?.[0]?.restaurants;
          return (Array.isArray(r) ? r[0] : r) as Restaurant | undefined;
        })();

  if (!restaurant) {
    return (
      <DashboardShell role={profile.role} title="Kitchen notices">
        <EmptyState message="No restaurant assigned." />
      </DashboardShell>
    );
  }

  const { data: notices } = await admin
    .from("restaurant_notices")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .order("created_at", { ascending: false });

  return (
    <DashboardShell role={profile.role} title="Kitchen notices">
      <Card>
        <RestaurantNoticesPanel
          restaurantId={restaurant.id}
          restaurantName={restaurant.name}
          initialNotices={(notices ?? []) as RestaurantNotice[]}
        />
      </Card>
    </DashboardShell>
  );
}
