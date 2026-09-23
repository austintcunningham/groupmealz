"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateRestaurantBranding } from "@/lib/actions/restaurants";
import { Button, ErrorMessage, Input, Select, SuccessMessage } from "@/components/ui";
import type { Restaurant } from "@/types/database";

export function RestaurantBrandingForm({
  restaurant,
  isAdmin,
}: {
  restaurant: Restaurant;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit(formData: FormData) {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await updateRestaurantBranding(restaurant.id, {
        logo_url: String(formData.get("logo_url") ?? ""),
        banner_url: String(formData.get("banner_url") ?? ""),
        branding_status: isAdmin
          ? (formData.get("branding_status") as "pending" | "approved" | "rejected")
          : undefined,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSuccess(isAdmin ? "Branding updated." : "Submitted for admin approval.");
      router.refresh();
    });
  }

  return (
    <form action={submit} className="space-y-3">
      {error ? <ErrorMessage message={error} /> : null}
      {success ? <SuccessMessage message={success} /> : null}
      <p className="text-sm text-slate-600">
        Status: <span className="font-medium capitalize">{restaurant.branding_status ?? "approved"}</span>
      </p>
      <Input name="logo_url" label="Logo URL" defaultValue={restaurant.logo_url ?? ""} placeholder="https://…" />
      <Input
        name="banner_url"
        label="Banner / hero image URL"
        defaultValue={restaurant.banner_url ?? ""}
        placeholder="https://…"
      />
      {isAdmin ? (
        <Select name="branding_status" label="Approval" defaultValue={restaurant.branding_status ?? "approved"}>
          <option value="pending">Pending</option>
          <option value="approved">Approved (show on order pages & emails)</option>
          <option value="rejected">Rejected</option>
        </Select>
      ) : null}
      <Button type="submit" loading={isPending}>
        Save branding
      </Button>
    </form>
  );
}
