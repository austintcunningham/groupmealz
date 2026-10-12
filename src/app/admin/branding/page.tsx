import Link from "next/link";
import { DashboardShell } from "@/components/DashboardShell";
import { Card, EmptyState } from "@/components/ui";
import { RestaurantBrandingPanel } from "@/components/restaurant/RestaurantBrandingPanel";
import { brandingNeedsReview } from "@/lib/restaurant/branding-display";
import { requireAdmin } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import type { Restaurant } from "@/types/database";

export default async function AdminBrandingReviewPage() {
  const profile = await requireAdmin();
  const supabase = await createClient();
  const { data: restaurants } = await supabase.from("restaurants").select("*").order("name");

  const pending = (restaurants ?? []).filter((r) => brandingNeedsReview(r));
  const others = (restaurants ?? []).filter((r) => !brandingNeedsReview(r));

  return (
    <DashboardShell role={profile.role} title="Branding review">
      <p className="mb-6 text-sm text-slate-600">
        Approve or deny restaurant logo and banner uploads. Each request includes a{" "}
        <strong>customer order screen</strong> preview.
      </p>

      {pending.length === 0 ? (
        <Card title="Pending review">
          <EmptyState message="No branding waiting for approval." />
          <Link href="/admin/restaurants" className="mt-3 inline-block text-sm text-[var(--geaux-red)] hover:underline">
            All restaurants →
          </Link>
        </Card>
      ) : (
        <div className="space-y-8">
          {pending.map((r) => (
            <Card key={r.id} title={`${r.name} — pending branding`}>
              <RestaurantBrandingPanel restaurant={r as Restaurant} isAdmin />
            </Card>
          ))}
        </div>
      )}

      {others.length > 0 ? (
        <details className="mt-8">
          <summary className="cursor-pointer text-sm font-medium text-slate-700">
            Other restaurants ({others.length})
          </summary>
          <ul className="mt-3 space-y-4">
            {others.map((r) => (
              <li key={r.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="font-medium">{r.name}</p>
                <div className="mt-3">
                  <RestaurantBrandingPanel restaurant={r as Restaurant} isAdmin />
                </div>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </DashboardShell>
  );
}
