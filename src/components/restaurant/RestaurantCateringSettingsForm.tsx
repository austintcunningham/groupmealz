"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateRestaurantCateringSettings } from "@/lib/actions/restaurants";
import { Button, Input } from "@/components/ui";
import type { Restaurant } from "@/types/database";

export function RestaurantCateringSettingsForm({
  restaurant,
  isAdmin,
}: {
  restaurant: Restaurant;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setOk(null);
    const fd = new FormData(e.currentTarget);
    const minRaw = String(fd.get("catering_min_order") ?? "").trim();
    const feeRaw = String(fd.get("catering_delivery_fee") ?? "").trim();
    startTransition(async () => {
      const result = await updateRestaurantCateringSettings(restaurant.id, {
        supports_catering: fd.get("supports_catering") === "on",
        catering_live_orders: isAdmin
          ? fd.get("catering_live_orders") === "on"
          : Boolean(restaurant.catering_live_orders),
        catering_min_order_cents: minRaw ? Math.round(Number(minRaw) * 100) : null,
        catering_lead_hours: Number(fd.get("catering_lead_hours") || 24),
        catering_delivery_fee_cents: feeRaw ? Math.round(Number(feeRaw) * 100) : 0,
        catering_description: String(fd.get("catering_description") ?? "").trim() || null,
        catering_service_area: String(fd.get("catering_service_area") ?? "").trim() || null,
        catering_cuisine: String(fd.get("catering_cuisine") ?? "").trim() || null,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setOk("Catering settings saved");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          name="supports_catering"
          defaultChecked={Boolean(restaurant.supports_catering)}
          className="mt-0.5 rounded"
        />
        <span>
          <strong>List on Find Catering</strong> — customers can open your catering page.
        </span>
      </label>
      {isAdmin ? (
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            name="catering_live_orders"
            defaultChecked={Boolean(restaurant.catering_live_orders)}
            className="mt-0.5 rounded"
          />
          <span>
            <strong>Accept live catering orders</strong> — admin only. Keep off for demo catalogs.
          </span>
        </label>
      ) : (
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
          Live catering checkout is{" "}
          <strong>{restaurant.catering_live_orders ? "enabled" : "disabled"}</strong>. Contact
          GroupMeals admin to change this.
        </p>
      )}
      <Input
        name="catering_cuisine"
        label="Cuisine / category"
        defaultValue={restaurant.catering_cuisine ?? ""}
        placeholder="Sandwiches & Subs"
      />
      <Input
        name="catering_service_area"
        label="Service area"
        defaultValue={restaurant.catering_service_area ?? ""}
        placeholder="Greater Baton Rouge"
      />
      <label className="block text-sm font-medium text-slate-700">
        Catering description
        <textarea
          name="catering_description"
          rows={4}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          defaultValue={restaurant.catering_description ?? ""}
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-3">
        <Input
          name="catering_min_order"
          label="Minimum order (USD)"
          type="number"
          step="0.01"
          min="0"
          defaultValue={
            restaurant.catering_min_order_cents != null
              ? (restaurant.catering_min_order_cents / 100).toFixed(2)
              : ""
          }
        />
        <Input
          name="catering_lead_hours"
          label="Lead time (hours)"
          type="number"
          min="1"
          defaultValue={restaurant.catering_lead_hours ?? 24}
        />
        <Input
          name="catering_delivery_fee"
          label="Delivery fee (USD)"
          type="number"
          step="0.01"
          min="0"
          defaultValue={((restaurant.catering_delivery_fee_cents ?? 0) / 100).toFixed(2)}
        />
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {ok ? <p className="text-sm text-green-700">{ok}</p> : null}
      <Button type="submit" loading={pending}>
        Save catering settings
      </Button>
    </form>
  );
}
