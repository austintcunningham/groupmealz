import type { Metadata } from "next";
import Link from "next/link";
import { getSessionProfile, getRoleHomePath } from "@/lib/auth/guards";
import { BRAND } from "@/lib/brand";
import { listCateringRestaurants } from "@/lib/catering/load";
import { MarketingSiteHeader } from "@/components/marketing/MarketingSiteHeader";
import { CateringSearchForm } from "@/components/catering/CateringSearchForm";
import { CateringRestaurantCard } from "@/components/catering/CateringRestaurantCard";

export const metadata: Metadata = {
  title: "Find Catering",
  description:
    "Browse catering from local restaurants for office lunches, meetings, parties, and events in Baton Rouge.",
};

export default async function CateringBrowsePage({
  searchParams,
}: {
  searchParams: Promise<{
    zip?: string;
    date?: string;
    time?: string;
    guests?: string;
    fulfillment?: string;
  }>;
}) {
  const params = await searchParams;
  const profile = await getSessionProfile();
  const signedInHref = profile ? getRoleHomePath(profile.role) : null;
  const restaurants = await listCateringRestaurants();

  const zip = params.zip?.trim();
  const filtered = zip
    ? restaurants.filter((r) => {
        const needle = zip.toLowerCase();
        const area = `${r.zip ?? ""} ${r.catering_service_area ?? ""} ${r.city ?? ""} ${r.state ?? ""}`.toLowerCase();
        return (
          area.includes(needle) ||
          (r.zip != null && r.zip.replace(/\D/g, "").startsWith(needle.replace(/\D/g, "").slice(0, 5)))
        );
      })
    : restaurants;

  return (
    <div className="min-h-screen">
      <MarketingSiteHeader signedInHref={signedInHref} />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-extrabold text-slate-900">Find catering</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          {BRAND.supportingMessage}
        </p>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <CateringSearchForm
            compact
            defaults={{
              zip: params.zip,
              date: params.date,
              time: params.time,
              guests: params.guests,
              fulfillment: params.fulfillment,
            }}
          />
        </div>

        {zip ? (
          <p className="mt-4 text-sm text-slate-600">
            Showing restaurants for <strong>{zip}</strong>
            {filtered.length !== restaurants.length
              ? ` (${filtered.length} of ${restaurants.length})`
              : null}
            . We only list partners that support catering — coverage is not invented.
          </p>
        ) : null}

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <CateringRestaurantCard key={r.id} restaurant={r} />
          ))}
        </div>

        {!filtered.length ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
            <p className="font-medium text-slate-800">No catering partners match yet</p>
            <p className="mt-2 text-sm text-slate-600">
              Try another ZIP, or{" "}
              <Link href="/order" className="font-semibold text-[var(--geaux-red)] hover:underline">
                start a group order
              </Link>{" "}
              for office lunch.
            </p>
          </div>
        ) : null}
      </main>
    </div>
  );
}
