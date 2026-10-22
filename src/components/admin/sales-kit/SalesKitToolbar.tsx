"use client";

import Link from "next/link";
import { useState } from "react";
import { downloadRestaurantOneSheetPdf } from "@/components/admin/sales-kit/download-one-sheet-pdf";

type SalesKitAudience = "restaurants" | "offices" | "hub" | "onboarding" | "restaurants-one-sheet";

export function SalesKitToolbar({
  audience,
  oneSheetPdfName,
}: {
  audience: SalesKitAudience;
  oneSheetPdfName?: string;
}) {
  const [pdfBusy, setPdfBusy] = useState(false);
  const isOneSheet = audience === "restaurants-one-sheet";

  async function handleDownloadPdf() {
    setPdfBusy(true);
    try {
      await downloadRestaurantOneSheetPdf(
        oneSheetPdfName ?? "groupmeals-restaurant-one-sheet.pdf"
      );
    } catch (err) {
      console.error(err);
      window.alert("Could not create PDF. Try again or refresh the page.");
    } finally {
      setPdfBusy(false);
    }
  }

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
        {!isOneSheet ? (
          <Link
            href="/admin/sales-kit/restaurants/one-sheet"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            Restaurant one-sheet
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
        {audience !== "onboarding" ? (
          <Link
            href="/admin/sales-kit/onboarding"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            Onboarding checklist
          </Link>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {isOneSheet ? (
          <>
            <button
              type="button"
              disabled={pdfBusy}
              onClick={() => void handleDownloadPdf()}
              className="rounded-lg bg-[var(--geaux-red)] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[var(--geaux-red-dark)] disabled:opacity-60"
            >
              {pdfBusy ? "Creating PDF…" : "Download PDF"}
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              Print…
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg bg-[var(--geaux-red)] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[var(--geaux-red-dark)]"
          >
            Print / Save PDF
          </button>
        )}
      </div>
    </div>
  );
}
