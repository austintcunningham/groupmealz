import Link from "next/link";
import { GroupMealsLogo } from "@/components/brand/GroupMealsLogo";
import { CustomerOrderRestaurantHero } from "@/components/order/CustomerOrderRestaurantHero";
import { MenuItemPhoto } from "@/components/order/MenuItemPhoto";
import { BRAND } from "@/lib/brand";
import type { SalesKitOrderPreviewSample } from "@/lib/sales-kit/order-preview-sample";

export function RestaurantSalesKitOrderPreview({ sample }: { sample: SalesKitOrderPreviewSample }) {
  const menu = sample.menuItems ?? [];
  return (
    <section className="sales-kit-order-preview sales-kit-print-flow overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-lg print:overflow-visible">
      <div className="sales-kit-print-unit border-b border-slate-200 bg-[var(--geaux-cream)] px-5 py-4">
        <h2 className="text-xl font-bold text-[var(--geaux-charcoal)]">
          Customer order screen — your branding
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {sample.orderBlurb ?? (
            <>
              Customers see {BRAND.name} at the top, then <strong>your logo, banner, and menu</strong> on
              the page where they build lunch. This preview uses{" "}
              <strong>{sample.restaurantName}</strong>&apos;s live menu
              {menu.some((m) => m.imageUrl) ? " and item photos" : ""} from the platform.
            </>
          )}
        </p>
        <Link
          href={sample.simulatePath}
          className="print:hidden mt-3 inline-block text-sm font-medium text-[var(--geaux-red)] hover:underline"
        >
          Open full interactive simulation →
        </Link>
      </div>

      <div className="sales-kit-print-unit overflow-hidden rounded-b-2xl border-t border-slate-100 print:overflow-visible">
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
              Menu
            </p>
            {menu.length ? (
              <ul className="mt-3 divide-y divide-slate-100">
                {menu.map((item) => (
                  <li key={item.name} className="py-4 first:pt-0">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <MenuItemPhoto
                        imageUrl={item.imageUrl}
                        itemName={item.name}
                        size="lg"
                        showPlaceholder
                      />
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold leading-snug text-slate-900">
                            {item.name}
                          </p>
                          <span className="shrink-0 text-sm font-medium text-slate-800">
                            {item.price}
                          </span>
                        </div>
                        {item.note ? <p className="text-xs text-slate-500">{item.note}</p> : null}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-slate-500">
                No active menu items found for this restaurant yet.
              </p>
            )}
            <p className="mt-3 text-xs text-slate-500">
              Full menu with modifiers, ingredients, and cart — same items customers see when
              ordering.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
