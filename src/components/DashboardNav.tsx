"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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
      className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-white/95 text-[var(--geaux-red-dark)] shadow-sm"
          : "text-white/90 hover:bg-white/15 hover:text-white"
      }`}
    >
      {link.label}
    </Link>
  );
}

function NavGroupMenu({
  label,
  links,
  isActive,
}: {
  label: string;
  links: DashboardNavLink[];
  isActive: (href: string) => boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const anyActive = links.some((l) => isActive(l.href));

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (links.length === 1) {
    return <NavPill link={links[0]} active={isActive(links[0].href)} />;
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${
          anyActive || open
            ? "bg-white/95 text-[var(--geaux-red-dark)] shadow-sm"
            : "text-white/90 hover:bg-white/15 hover:text-white"
        }`}
      >
        {label}
        <span className="text-[10px] opacity-80" aria-hidden>
          ▾
        </span>
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute left-0 top-full z-50 mt-1.5 min-w-[11rem] overflow-hidden rounded-xl border border-slate-200/90 bg-white py-1 shadow-lg"
        >
          {links.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className={`block px-3.5 py-2 text-sm ${
                  active
                    ? "bg-red-50 font-semibold text-[var(--geaux-red-dark)]"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
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
        className="flex flex-wrap items-center gap-1.5 pb-1"
        aria-label="Dashboard sections"
      >
        {groups.map((group) => (
          <NavGroupMenu key={group.label} label={group.label} links={group.links} isActive={isActive} />
        ))}
      </nav>
    );
  }

  return (
    <nav
      className="flex flex-wrap gap-1.5 pb-1"
      aria-label="Dashboard sections"
    >
      {(links ?? []).map((link) => (
        <NavPill key={link.href} link={link} active={isActive(link.href)} />
      ))}
    </nav>
  );
}
