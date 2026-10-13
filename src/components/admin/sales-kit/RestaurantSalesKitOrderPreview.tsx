import Link from "next/link";
import { GroupMealsLogo } from "@/components/brand/GroupMealsLogo";
import { CustomerOrderRestaurantHero } from "@/components/order/CustomerOrderRestaurantHero";
import { BRAND } from "@/lib/brand";
import type { SalesKitOrderPreviewSample } from "@/lib/sales-kit/order-preview-sample";

const SAMPLE_MENU = [
  { name: "Hook & Ladder — Medium", price: "$10.99", note: "Sizes & combos configured per partner" },
  { name: "Sub, Chips, & Drink — Combo", price: "$13.99", note: "Sides and drinks as you define them" },
];

export function RestaurantSalesKitOrderPreview({ sample }: { sample: SalesKitOrderPreviewSample }) {
  return (
    <section className="sales-kit-section break-inside-avoid overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-lg">
      <div className="border-b border-slate-200 bg-[var(--geaux-cream)] px-5 py-4">
        <h2 className="text-xl font-bold text-[var(--geaux-charcoal)]">
          Customer order screen — your branding
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Employees see {BRAND.name} at the top, then <strong>your logo, banner, and menu</strong> on
          the page where they build lunch. This is the same layout as live ordering
          {sample.logoUrl || sample.bannerUrl ? (
            <>
              {" "}
              (sample: <strong>{sample.restaurantName}</strong>)
            </>
          ) : (
            <> — upload logo &amp; banner during onboarding to replace placeholders</>
          )}
          .
        </p>
        <Link
          href={sample.simulatePath}
          className="print:hidden mt-3 inline-block text-sm font-medium text-[var(--geaux-red)] hover:underline"
        >
          Open full interactive simulation →
        </Link>
      </div>

      <div className="overflow-hidden rounded-b-2xl border-t border-slate-100">
        <div className="geaux-header-gradient text-white">
          <div className="geaux-accent-bar" />
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <GroupMealsLogo size="sm" href={undefined} surface="light" />
              <p className="mt-1 truncate text-xs text-white/85">{sample.officeName}</p>
            </div>
            <span className="print:hidden shrink-0 text-xs text-white/70">Staff login</span>
          </div>
        </div>

        <div className="bg-[var(--geaux-cream)] px-4 py-5">
          <CustomerOrderRestaurantHero
            officeLabel={sample.officeName}
            restaurantName={sample.restaurantName}
            dateLabel={sample.lunchDateLabel}
            logoUrl={sample.logoUrl}
            bannerUrl={sample.bannerUrl}
          />

          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--geaux-red)]">
              Menu (sample)
            </p>
            <ul className="mt-3 divide-y divide-slate-100">
              {SAMPLE_MENU.map((item) => (
                <li key={item.name} className="flex items-start justify-between gap-3 py-3 first:pt-0">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.note}</p>
                  </div>
                  <span className="shrink-0 text-sm font-medium text-slate-800">{item.price}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-slate-500">
              Full menu with modifiers, ingredients, and cart — configured with your onboarding
              specialist.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
