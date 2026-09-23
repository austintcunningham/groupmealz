"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function DashboardNav({ links }: { links: { href: string; label: string }[] }) {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (href === "/admin" || href === "/restaurant" || href === "/office" || href === "/app") {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <nav
      className="flex gap-1 overflow-x-auto overscroll-x-contain pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label="Dashboard sections"
    >
      {links.map((link) => {
        const active = isActive(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              active
                ? "bg-white/20 text-[var(--geaux-yellow)]"
                : "text-white/90 hover:bg-white/10 hover:text-[var(--geaux-yellow-light)]"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
