import Link from "next/link";
import { notFound } from "next/navigation";
import { CustomerOrderSimulationShell } from "@/components/order/CustomerOrderSimulationShell";
import { requireAdmin } from "@/lib/auth/guards";
import { buildRestaurantOrderSimulation } from "@/lib/order/build-simulation-context";
import { createClient } from "@/lib/supabase/server";

export default async function AdminSimulateOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ restaurantSlug: string }>;
  searchParams: Promise<{ office?: string; date?: string }>;
}) {
  await requireAdmin();
  const { restaurantSlug } = await params;
  const { office: officeSlug, date: lunchDate } = await searchParams;

  const supabase = await createClient();
  const { data: restaurants } = await supabase.from("restaurants").select("slug, name").order("name");

  const simulation = await buildRestaurantOrderSimulation(restaurantSlug, { officeSlug, lunchDate });
  if (!simulation) notFound();

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[var(--geaux-cream)]">
      <div className="w-full border-b border-slate-200 bg-white px-4 py-2.5 shadow-sm">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <Link href="/admin" className="font-medium text-[var(--geaux-red)] hover:underline">
            ← Admin
          </Link>
          <span className="hidden text-slate-300 sm:inline">|</span>
          <span className="text-slate-600">Customer order simulation</span>
          <div className="flex flex-wrap gap-1.5">
            {(restaurants ?? []).map((r) => (
              <Link
                key={r.slug}
                href={`/admin/simulate-order/${encodeURIComponent(r.slug)}${officeSlug ? `?office=${encodeURIComponent(officeSlug)}` : ""}`}
                className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                  r.slug === restaurantSlug
                    ? "border-[var(--geaux-red)] bg-red-50 text-[var(--geaux-red)]"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                {r.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <CustomerOrderSimulationShell simulation={simulation} staffLoginHref="/admin" />
    </div>
  );
}
