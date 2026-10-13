import Link from "next/link";
import { Suspense } from "react";
import { OrderFlowClient } from "@/components/employee/OrderFlowClient";
import { GroupMealsLogo } from "@/components/brand/GroupMealsLogo";
import type { RestaurantOrderSimulation } from "@/lib/order/build-simulation-context";

export function CustomerOrderSimulationShell({
  simulation,
  staffLoginHref = "/login",
}: {
  simulation: RestaurantOrderSimulation;
  staffLoginHref?: string;
}) {
  const { office, schedule, weekDays, categories, menuItems, sizesByMenuItemId, ingredientsByMenuItemId, advanceOrderHours, feeSettings } =
    simulation;

  return (
    <div className="min-h-screen w-full min-w-0 bg-[var(--geaux-cream)]">
      <header className="geaux-header-gradient w-full text-white shadow-md">
        <div className="geaux-accent-bar" />
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div className="min-w-0">
            <GroupMealsLogo size="md" href="/order" priority surface="light" />
            <p className="mt-1 truncate text-sm text-white/85">{office.name}</p>
          </div>
          <Link href={staffLoginHref} className="shrink-0 text-sm text-white/90 hover:text-[var(--geaux-yellow)]">
            Staff login
          </Link>
        </div>
      </header>
      <div className="w-full border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-950">
        <strong>Simulation only</strong> — full customer menu (sizes, ingredients, restaurant note). Checkout
        is disabled; no order is placed.
      </div>
      <main className="geaux-main-enter mx-auto w-full min-w-0 max-w-6xl px-4 py-8 pb-16">
        <Suspense fallback={<p className="text-sm text-slate-500">Loading menu…</p>}>
          <OrderFlowClient
            office={office}
            schedule={schedule}
            weekDays={weekDays}
            categories={categories}
            menuItems={menuItems}
            sizesByMenuItemId={sizesByMenuItemId}
            ingredientsByMenuItemId={ingredientsByMenuItemId}
            guestMode
            isLoggedIn={false}
            advanceOrderHours={advanceOrderHours}
            feeSettings={feeSettings}
            previewMode
          />
        </Suspense>
      </main>
    </div>
  );
}
