"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type DashboardNavLink = { href: string; label: string };
export type DashboardNavGroup = { label: string; links: DashboardNavLink[] };

function useIsActive() {
  const pathname = usePathname() ?? "";
  return (href: string): boolean => {
    if (!pathname) return false;
    if (href === "/admin" || href === "/restaurant" || href === "/office" || href === "/app") {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };
}

function NavPill({ link, active }: { link: DashboardNavLink; active: boolean }) {
  return (
    <Link
      href={link.href}
      className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-white/95 text-[var(--geaux-red-dark)] shadow-sm"
          : "text-white/90 hover:bg-white/15 hover:text-white"
      }`}
    >
      {link.label}
    </Link>
  );
}

export function DashboardNav({
  links,
  groups,
}: {
  links?: DashboardNavLink[];
  groups?: DashboardNavGroup[];
}) {
  const isActive = useIsActive();

  if (groups?.length) {
    return (
      <nav
        className="flex items-center gap-1 overflow-x-auto overscroll-x-contain pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Dashboard sections"
      >
        {groups.map((group, groupIndex) => (
          <span key={group.label} className="contents">
            {groupIndex > 0 ? (
              <span
                className="mx-0.5 h-5 w-px shrink-0 self-center bg-white/25"
                aria-hidden
              />
            ) : null}
            {group.links.map((link) => (
              <NavPill key={link.href} link={link} active={isActive(link.href)} />
            ))}
          </span>
        ))}
      </nav>
    );
  }

  return (
    <nav
      className="flex gap-1 overflow-x-auto overscroll-x-contain pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label="Dashboard sections"
    >
      {(links ?? []).map((link) => (
        <NavPill key={link.href} link={link} active={isActive(link.href)} />
      ))}
    </nav>
  );
}
