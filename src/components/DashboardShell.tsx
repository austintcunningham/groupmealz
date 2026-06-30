import Link from "next/link";
import type { UserRole } from "@/types/database";

const navByRole: Record<UserRole, { href: string; label: string }[]> = {
  admin: [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/restaurants", label: "Restaurants" },
    { href: "/admin/offices", label: "Offices" },
    { href: "/admin/menus", label: "Menus" },
    { href: "/admin/schedules", label: "Schedules" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/settings", label: "Settings" },
  ],
  restaurant_manager: [
    { href: "/restaurant", label: "Dashboard" },
    { href: "/restaurant/production", label: "Production" },
    { href: "/restaurant/orders", label: "Orders" },
    { href: "/restaurant/menu", label: "Menu" },
  ],
  office_admin: [
    { href: "/office", label: "Dashboard" },
    { href: "/office/employees", label: "Employees" },
    { href: "/office/orders", label: "Orders" },
  ],
  employee: [
    { href: "/app", label: "Home" },
    { href: "/app/today", label: "Order Today" },
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
  const links = navByRole[role];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">Office Lunch</p>
            <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
          </div>
          <nav className="flex flex-wrap gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                {link.label}
              </Link>
            ))}
            <form action="/api/auth/signout" method="post">
              <SignOutButton />
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}

function SignOutButton() {
  return (
    <button
      formAction={async () => {
        "use server";
        const { createClient } = await import("@/lib/supabase/server");
        const supabase = await createClient();
        await supabase.auth.signOut();
        const { redirect } = await import("next/navigation");
        redirect("/login");
      }}
      className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
      type="submit"
    >
      Sign out
    </button>
  );
}
