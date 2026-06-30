"use client";

import { useState, useTransition } from "react";
import { updatePlatformSettings } from "@/lib/actions/orders";
import { ErrorMessage } from "@/components/ui";
import type { PlatformSettings } from "@/types/database";

export function PlatformSettingsForm({ settings }: { settings: PlatformSettings }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await updatePlatformSettings(settings.id, {
        platform_fee_type: formData.get("platform_fee_type") as PlatformSettings["platform_fee_type"],
        flat_fee_cents: Math.round(Number(formData.get("flat_fee_dollars")) * 100),
        percentage_bps: Math.round(Number(formData.get("percentage")) * 100),
        sales_tax_bps: Math.round(Number(formData.get("sales_tax")) * 100),
      });
      if (!result.success) setError(result.error);
      else window.location.reload();
    });
  }

  return (
    <form action={handleSubmit} className="max-w-md space-y-4">
      {error ? <ErrorMessage message={error} /> : null}
      <div>
        <label className="mb-1 block text-sm font-medium">Fee type</label>
        <select
          name="platform_fee_type"
          defaultValue={settings.platform_fee_type}
          className="w-full rounded-lg border px-3 py-2 text-sm"
        >
          <option value="flat">Flat</option>
          <option value="percentage">Percentage</option>
          <option value="hybrid">Hybrid</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Flat fee (USD)</label>
        <input
          name="flat_fee_dollars"
          type="number"
          step="0.01"
          defaultValue={(settings.flat_fee_cents / 100).toFixed(2)}
          className="w-full rounded-lg border px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Percentage (%)</label>
        <input
          name="percentage"
          type="number"
          step="0.01"
          defaultValue={(settings.percentage_bps / 100).toFixed(2)}
          className="w-full rounded-lg border px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Sales tax (%)</label>
        <input
          name="sales_tax"
          type="number"
          step="0.01"
          defaultValue={(settings.sales_tax_bps / 100).toFixed(2)}
          className="w-full rounded-lg border px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
      >
        Save settings
      </button>
    </form>
  );
}
