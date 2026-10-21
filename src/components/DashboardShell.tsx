import type { UserRole } from "@/types/database";
import { SignOutForm } from "@/components/auth/SignOutForm";
import { GroupMealsLogo } from "@/components/brand/GroupMealsLogo";
import { DashboardNav, type DashboardNavGroup } from "@/components/DashboardNav";

const adminNavGroups: DashboardNavGroup[] = [
  {
    label: "Dashboard",
    links: [{ href: "/admin", label: "Dashboard" }],
  },
  {
    label: "Partners",
    links: [
      { href: "/admin/restaurants", label: "Restaurants" },
      { href: "/admin/branding", label: "Branding review" },
      { href: "/admin/offices", label: "Offices" },
      { href: "/admin/menus", label: "Menus" },
    ],
  },
  {
    label: "Operate",
    links: [
      { href: "/admin/schedules", label: "Schedules" },
      { href: "/admin/announcements", label: "ROTD emails" },
      { href: "/admin/orders", label: "Orders" },
      { href: "/admin/payouts", label: "Payouts" },
    ],
  },
  {
    label: "Tools",
    links: [
      { href: "/admin/reviews", label: "Feedback" },
      { href: "/admin/settings", label: "Settings" },
      { href: "/admin/email-preview", label: "Email preview" },
      { href: "/admin/sales-kit", label: "Sales kit" },
      { href: "/admin/simulate-order", label: "Order simulation" },
    ],
  },
];

const navByRole: Record<UserRole, { href: string; label: string }[]> = {
  admin: [],
  restaurant_manager: [
    { href: "/restaurant", label: "Dashboard" },
    { href: "/restaurant/reports", label: "Sales & payouts" },
    { href: "/restaurant/production", label: "Order list" },
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
  const navGroups = role === "admin" ? adminNavGroups : undefined;

  return (
    <div className="min-h-screen">
      <header className="dashboard-app-header geaux-header-gradient text-white print:hidden">
        <div className="geaux-accent-bar" />
        <div className="mx-auto max-w-6xl px-4 pt-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <GroupMealsLogo size="sm" href="/" surface="light" />
              <h1 className="mt-1 truncate text-lg font-semibold leading-tight text-white/95">
                {title}
              </h1>
            </div>
            <SignOutForm />
          </div>
          <div className="mt-2 border-t border-white/15 pt-2">
            <DashboardNav links={navGroups ? undefined : links} groups={navGroups} />
          </div>
        </div>
      </header>
      <main className="geaux-main-enter mx-auto max-w-6xl px-4 py-8 pb-12">{children}</main>
    </div>
  );
}
