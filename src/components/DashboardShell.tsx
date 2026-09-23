import Link from "next/link";
import type { UserRole } from "@/types/database";
import { SignOutForm } from "@/components/auth/SignOutForm";
import { DashboardNav } from "@/components/DashboardNav";
import { BRAND } from "@/lib/brand";

const navByRole: Record<UserRole, { href: string; label: string }[]> = {
  admin: [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/restaurants", label: "Restaurants" },
    { href: "/admin/offices", label: "Offices" },
    { href: "/admin/menus", label: "Menus" },
    { href: "/admin/schedules", label: "Schedules" },
    { href: "/admin/announcements", label: "ROTD emails" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/payouts", label: "Payouts" },
    { href: "/admin/reviews", label: "Feedback" },
    { href: "/admin/settings", label: "Settings" },
    { href: "/admin/email-preview", label: "Email preview" },
  ],
  restaurant_manager: [
    { href: "/restaurant", label: "Dashboard" },
    { href: "/restaurant/reports", label: "Sales & payouts" },
    { href: "/restaurant/production", label: "Prep list" },
    { href: "/restaurant/orders", label: "Orders" },
    { href: "/restaurant/menu", label: "Menu" },
    { href: "/restaurant/branding", label: "Branding" },
  ],
  office_admin: [
    { href: "/office", label: "Dashboard" },
    { href: "/office/employees", label: "Employees" },
    { href: "/office/orders", label: "Orders" },
  ],
  employee: [
    { href: "/app", label: "Home" },
    { href: "/app/week", label: "This Week" },
    { href: "/order", label: "Order" },
    { href: "/app/orders", label: "My Orders" },
    { href: "/app/settings", label: "Settings" },
  ],
};

export function DashboardShell({
  role,
  title,
  children,
}: {
  role: UserRole;
  title: string;
  children: React.ReactNode;
}) {
  const links = navByRole[role] ?? [];

  return (
    <div className="min-h-screen bg-[var(--geaux-cream)]">
      <header className="geaux-header-gradient text-white shadow-md">
        <div className="geaux-accent-bar" />
        <div className="mx-auto max-w-6xl px-4 pt-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <Link
                href="/"
                className="text-base font-black tracking-tight text-[var(--geaux-yellow)]"
              >
                {BRAND.name}
              </Link>
              <h1 className="truncate text-lg font-semibold leading-tight text-white/95">
                {title}
              </h1>
            </div>
            <SignOutForm />
          </div>
          <div className="mt-2 border-t border-white/15 pt-2">
            <DashboardNav links={links} />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
