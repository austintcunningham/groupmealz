import Image from "next/image";
import Link from "next/link";
import { formatLeadTime } from "@/lib/catering/load";
import { formatCents } from "@/lib/catering/cart-types";
import type { Restaurant } from "@/types/database";

export function CateringRestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const live = Boolean(restaurant.catering_live_orders);
  const min =
    restaurant.catering_min_order_cents != null
      ? formatCents(restaurant.catering_min_order_cents)
      : null;

  return (
    <Link
      href={`/catering/${restaurant.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[var(--geaux-shadow-sm)] transition hover:-translate-y-0.5 hover:shadow-[var(--geaux-shadow-md)]"
    >
      <div className="relative aspect-[16/9] bg-gradient-to-br from-slate-100 to-slate-200">
        {restaurant.banner_url || restaurant.logo_url ? (
          <Image
            src={restaurant.banner_url || restaurant.logo_url!}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width:768px) 100vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-slate-400">
            {restaurant.name}
          </div>
        )}
        {!live ? (
          <span className="absolute left-3 top-3 rounded-full bg-amber-500 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow">
            Demo catalog
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start gap-3">
          {restaurant.logo_url ? (
            <Image
              src={restaurant.logo_url}
              alt=""
              width={44}
              height={44}
              className="h-11 w-11 rounded-lg border border-slate-100 object-contain bg-white"
            />
          ) : null}
          <div className="min-w-0">
            <h3 className="truncate font-bold text-slate-900 group-hover:text-[var(--geaux-red)]">
              {restaurant.name}
            </h3>
            <p className="text-sm text-slate-500">
              {restaurant.catering_cuisine || "Catering"}
              {restaurant.city ? ` · ${restaurant.city}` : ""}
            </p>
          </div>
        </div>
        <ul className="mt-auto space-y-1 text-xs text-slate-600">
          <li>
            {live ? "Accepting catering orders" : "Preview only — orders disabled"}
          </li>
          {min ? <li>Minimum {min}</li> : null}
          <li>{formatLeadTime(restaurant.catering_lead_hours ?? 24)}</li>
          <li>Delivery & pickup</li>
          {(restaurant.catering_delivery_fee_cents ?? 0) > 0 ? (
            <li>Delivery fee from {formatCents(restaurant.catering_delivery_fee_cents!)}</li>
          ) : (
            <li>Delivery fee listed at checkout when configured</li>
          )}
        </ul>
      </div>
    </Link>
  );
}
