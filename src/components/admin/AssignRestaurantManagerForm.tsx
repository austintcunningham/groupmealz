"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { assignRestaurantManager } from "@/lib/actions/restaurants";
import { findProfileIdByEmail } from "@/lib/actions/users";
import { Button, ErrorMessage, Input, Select, SuccessMessage } from "@/components/ui";
import type { Restaurant } from "@/types/database";

export function AssignRestaurantManagerForm({
  restaurants,
}: {
  restaurants: Restaurant[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(null);
    const email = String(formData.get("email") ?? "");

    startTransition(async () => {
      const lookup = await findProfileIdByEmail(email);
      if (!lookup.success) {
        setError(lookup.error);
        return;
      }

      const result = await assignRestaurantManager(
        String(formData.get("restaurant_id") ?? ""),
        lookup.data.id
      );
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSuccess(`${lookup.data.full_name || lookup.data.email} assigned as manager`);
      router.refresh();
    });
  }

  if (!restaurants.length) return null;

  return (
    <form action={handleSubmit} className="mt-6 space-y-3 border-t pt-6">
      <h3 className="font-medium text-slate-900">Assign restaurant manager</h3>
      {error ? <ErrorMessage message={error} /> : null}
      {success ? <SuccessMessage message={success} /> : null}
      <Select name="restaurant_id" label="Restaurant" required>
        {restaurants.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </Select>
      <Input
        name="email"
        label="User email"
        type="email"
        required
        placeholder="manager@restaurant.com"
      />
      <Button type="submit" variant="secondary" loading={isPending}>
        Assign manager
      </Button>
    </form>
  );
}
