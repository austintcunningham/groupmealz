"use client";

import Link from "next/link";
import { useState } from "react";
import { GroupMealsLogo } from "@/components/brand/GroupMealsLogo";

export function MarketingSiteHeader({
  signedInHref,
}: {
  signedInHref?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const [restOpen, setRestOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-red-900/20 bg-[var(--geaux-red)] text-white shadow-md">
      <div className="geaux-accent-bar" />
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <GroupMealsLogo size="md" href="/" surface="light" />

        <nav className="hidden items-center gap-1 lg:flex">
          <Link href="/catering" className="rounded-lg px-3 py-2 text-sm font-semibold text-white/95 hover:bg-white/10">
            Find Catering
          </Link>
          <Link href="/#how-it-works" className="rounded-lg px-3 py-2 text-sm font-medium text-white/90 hover:bg-white/10">
            How It Works
          </Link>
          <div className="relative">
            <button
              type="button"
              className="rounded-lg px-3 py-2 text-sm font-medium text-white/90 hover:bg-white/10"
              onClick={() => {
                setGroupOpen((v) => !v);
                setRestOpen(false);
              }}
            >
              Group Ordering ▾
            </button>
            {groupOpen ? (
              <div className="absolute left-0 top-full z-50 mt-1 min-w-[14rem] rounded-xl border border-slate-200 bg-white py-2 text-slate-800 shadow-lg">
                <Link href="/order" className="block px-4 py-2 text-sm hover:bg-slate-50" onClick={() => setGroupOpen(false)}>
                  Start a Group Order
                </Link>
                <Link href="/order" className="block px-4 py-2 text-sm hover:bg-slate-50" onClick={() => setGroupOpen(false)}>
                  Join a Group Order
                </Link>
                <Link href="/faq" className="block px-4 py-2 text-sm hover:bg-slate-50" onClick={() => setGroupOpen(false)}>
                  How Group Ordering Works
                </Link>
              </div>
            ) : null}
          </div>
          <div className="relative">
            <button
              type="button"
              className="rounded-lg px-3 py-2 text-sm font-medium text-white/90 hover:bg-white/10"
              onClick={() => {
                setRestOpen((v) => !v);
                setGroupOpen(false);
              }}
            >
              For Restaurants ▾
            </button>
            {restOpen ? (
              <div className="absolute left-0 top-full z-50 mt-1 min-w-[15rem] rounded-xl border border-slate-200 bg-white py-2 text-slate-800 shadow-lg">
                <Link href="/#partners" className="block px-4 py-2 text-sm hover:bg-slate-50" onClick={() => setRestOpen(false)}>
                  Become a Restaurant Partner
                </Link>
                <Link href="/login" className="block px-4 py-2 text-sm hover:bg-slate-50" onClick={() => setRestOpen(false)}>
                  Restaurant Login
                </Link>
                <Link href="/restaurant" className="block px-4 py-2 text-sm hover:bg-slate-50" onClick={() => setRestOpen(false)}>
                  Restaurant Dashboard
                </Link>
                <Link href="/restaurant/menu" className="block px-4 py-2 text-sm hover:bg-slate-50" onClick={() => setRestOpen(false)}>
                  Restaurant Management
                </Link>
              </div>
            ) : null}
          </div>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href={signedInHref || "/login"}
            className="rounded-lg px-3 py-2 text-sm font-medium text-white/90 hover:bg-white/10"
          >
            {signedInHref ? "Dashboard" : "Sign In"}
          </Link>
          <Link
            href="/catering"
            className="rounded-full bg-[var(--geaux-yellow)] px-4 py-2 text-sm font-bold text-[var(--geaux-charcoal)] shadow-sm hover:bg-[var(--geaux-yellow-light)]"
          >
            Order Catering
          </Link>
        </div>

        <button
          type="button"
          className="rounded-lg border border-white/30 px-3 py-2 text-sm font-semibold lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          Menu
        </button>
      </div>

      {open ? (
        <div className="border-t border-white/15 bg-[var(--geaux-red-dark)] px-4 py-4 lg:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 text-sm">
            <Link href="/catering" className="rounded-lg px-3 py-2.5 font-semibold hover:bg-white/10" onClick={() => setOpen(false)}>
              Find Catering
            </Link>
            <Link href="/#how-it-works" className="rounded-lg px-3 py-2.5 hover:bg-white/10" onClick={() => setOpen(false)}>
              How It Works
            </Link>
            <p className="px-3 pt-2 text-xs font-bold uppercase tracking-wide text-white/60">Group Ordering</p>
            <Link href="/order" className="rounded-lg px-3 py-2 hover:bg-white/10" onClick={() => setOpen(false)}>
              Start / Join a Group Order
            </Link>
            <p className="px-3 pt-2 text-xs font-bold uppercase tracking-wide text-white/60">Restaurants</p>
            <Link href="/#partners" className="rounded-lg px-3 py-2 hover:bg-white/10" onClick={() => setOpen(false)}>
              Become a Partner
            </Link>
            <Link href="/login" className="rounded-lg px-3 py-2 hover:bg-white/10" onClick={() => setOpen(false)}>
              Restaurant Login
            </Link>
            <Link
              href="/catering"
              className="mt-2 rounded-full bg-[var(--geaux-yellow)] px-4 py-3 text-center font-bold text-[var(--geaux-charcoal)]"
              onClick={() => setOpen(false)}
            >
              Order Catering
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
