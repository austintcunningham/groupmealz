import Link from "next/link";
import type { UserRole } from "@/types/database";
import { signOut } from "@/lib/actions/auth";
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
    { href: "/admin/settings", label: "Settings" },
    { href: "/admin/email-preview", label: "Email preview" },
  ],
  restaurant_manager: [
    { href: "/restaurant", label: "Dashboard" },
    { href: "/restaurant/reports", label: "Reports" },
    { href: "/restaurant/production", label: "Production" },
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
      <header className="geaux-header-gradient text-white shadow-lg">
        <div className="geaux-accent-bar" />
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/" className="text-lg font-black tracking-tight text-[var(--geaux-yellow)]">
              {BRAND.name}
            </Link>
            <h1 className="text-xl font-semibold text-white/95">{title}</h1>
          </div>
          <nav className="flex flex-wrap gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-white/90 transition-all hover:bg-white/15 hover:text-[var(--geaux-yellow)] active:scale-95"
              >
                {link.label}
              </Link>
            ))}
            <SignOutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}

function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--geaux-yellow-light)] transition-all hover:bg-white/10 active:scale-95"
        type="submit"
      >
        Sign out
      </button>
    </form>
  );
}
