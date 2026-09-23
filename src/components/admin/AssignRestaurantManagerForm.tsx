"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { assignRestaurantManagerByEmail } from "@/lib/actions/restaurants";
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
      const result = await assignRestaurantManagerByEmail(
        String(formData.get("restaurant_id") ?? ""),
        email
      );
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSuccess(
        result.data.status === "invited"
          ? `${result.data.email} invited — manager access applies when they create an account at /signup.`
          : `${result.data.email} is now a manager for this restaurant.`
      );
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
        label="Manager email"
        type="email"
        required
        placeholder="manager@restaurant.com"
      />
      <Button type="submit" variant="secondary" loading={isPending}>
        Assign or invite
      </Button>
      <p className="text-xs text-slate-500">
        They can sign up later with this email — no need to create their account first.
      </p>
    </form>
  );
}
