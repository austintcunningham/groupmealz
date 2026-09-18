"use client";

import { useState } from "react";
import { officeOrderPath } from "@/lib/offices/slug";
import type { Office } from "@/types/database";

export function OfficeOrderLinks({ offices, appUrl }: { offices: Office[]; appUrl: string }) {
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(url: string, id: string) {
    await navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <ul className="divide-y divide-slate-100">
      {offices.map((o) => {
        if (!o.slug) return null;
        const path = officeOrderPath(o.slug);
        const full = `${appUrl.replace(/\/$/, "")}${path}`;
        return (
          <li key={o.id} className="py-4">
            <p className="font-medium">{o.name}</p>
            <code className="mt-1 block break-all rounded bg-slate-50 px-2 py-1 text-xs text-slate-700">
              {full}
            </code>
            <button
              type="button"
              onClick={() => copy(full, o.id)}
              className="mt-2 text-sm font-medium text-red-600 hover:underline"
            >
              {copied === o.id ? "Copied!" : "Copy link"}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
