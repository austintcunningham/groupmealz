import Link from "next/link";
import { DashboardShell } from "@/components/DashboardShell";
import { Card, EmptyState } from "@/components/ui";
import { RestaurantCateringSettingsForm } from "@/components/restaurant/RestaurantCateringSettingsForm";
import { requireRestaurantManager } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import type { Restaurant } from "@/types/database";

export default async function RestaurantCateringPage() {
  const profile = await requireRestaurantManager();
  const supabase = await createClient();

  const { data: links } = await supabase
    .from("restaurant_users")
    .select("restaurant_id, restaurants(*)")
    .eq("user_id", profile.id);

  const restaurant =
    profile.role === "admin"
      ? ((await supabase.from("restaurants").select("*").order("name").limit(1)).data?.[0] as
          | Restaurant
          | undefined)
      : (() => {
          const r = links?.[0]?.restaurants;
          return (Array.isArray(r) ? r[0] : r) as Restaurant | undefined;
        })();

  if (!restaurant) {
    return (
      <DashboardShell role={profile.role} title="Catering">
        <EmptyState message="No restaurant assigned." />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role={profile.role} title="Catering settings">
      <Card title={restaurant.name}>
        <p className="mb-4 text-sm text-slate-600">
          Configure how your restaurant appears on the public catering marketplace. Manage catering
          products from the{" "}
          <Link href="/restaurant/menu" className="font-semibold text-[var(--geaux-red)] hover:underline">
            Menu
          </Link>{" "}
          editor (enable “Show on catering menu” per item).
        </p>
        <RestaurantCateringSettingsForm
          restaurant={restaurant}
          isAdmin={profile.role === "admin"}
        />
        {restaurant.supports_catering ? (
          <p className="mt-4 text-sm">
            <Link
              href={`/catering/${restaurant.slug}`}
              className="font-semibold text-[var(--geaux-red)] hover:underline"
            >
              Preview public catering page →
            </Link>
          </p>
        ) : null}
      </Card>
    </DashboardShell>
  );
}
