"use client";

import Link from "next/link";

export function SalesKitToolbar({
  audience,
}: {
  audience: "restaurants" | "offices" | "hub";
}) {
  return (
    <div className="print:hidden mb-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/sales-kit"
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
        >
          Sales kit home
        </Link>
        {audience !== "restaurants" ? (
          <Link
            href="/admin/sales-kit/restaurants"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            Restaurant packet
          </Link>
        ) : null}
        {audience !== "offices" ? (
          <Link
            href="/admin/sales-kit/offices"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            Office packet
          </Link>
        ) : null}
        <Link
          href="/admin/email-preview"
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--geaux-red)] ring-1 ring-red-200 hover:bg-red-50"
        >
          Live email previews
        </Link>
      </div>
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-lg bg-[var(--geaux-red)] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[var(--geaux-red-dark)]"
      >
        Print / Save PDF
      </button>
    </div>
  );
}
