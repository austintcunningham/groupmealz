import { DashboardShell } from "@/components/DashboardShell";
import { Card, EmptyState } from "@/components/ui";
import { RestaurantBrandingForm } from "@/components/admin/RestaurantBrandingForm";
import { requireRestaurantManager } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

export default async function RestaurantBrandingPage() {
  const profile = await requireRestaurantManager();
  const supabase = await createClient();

  const { data: links } = await supabase
    .from("restaurant_users")
    .select("restaurant_id, restaurants(*)")
    .eq("user_id", profile.id);

  const restaurant =
    profile.role === "admin"
      ? (await supabase.from("restaurants").select("*").order("name").limit(1)).data?.[0]
      : (() => {
          const r = links?.[0]?.restaurants;
          return Array.isArray(r) ? r[0] : r;
        })();

  if (!restaurant) {
    return (
      <DashboardShell role={profile.role} title="Branding">
        <EmptyState message="No restaurant assigned." />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role={profile.role} title="Branding & imagery">
      <Card title={restaurant.name}>
        <RestaurantBrandingForm restaurant={restaurant as import("@/types/database").Restaurant} isAdmin={false} />
      </Card>
    </DashboardShell>
  );
}
