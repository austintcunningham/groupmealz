"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createRestaurant } from "@/lib/actions/restaurants";
import { Button, ErrorMessage, Input, SuccessMessage } from "@/components/ui";

export function CreateRestaurantForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await createRestaurant({
        name: String(formData.get("name") ?? ""),
        slug: String(formData.get("slug") ?? ""),
        description: String(formData.get("description") ?? "") || undefined,
        street_address: String(formData.get("street_address") ?? "") || undefined,
        city: String(formData.get("city") ?? "") || undefined,
        state: String(formData.get("state") ?? "") || undefined,
        zip: String(formData.get("zip") ?? "") || undefined,
        phone: String(formData.get("phone") ?? "") || undefined,
        email: String(formData.get("email") ?? "") || undefined,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSuccess("Restaurant created");
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      {error ? <ErrorMessage message={error} /> : null}
      {success ? <SuccessMessage message={success} /> : null}
      <Input name="name" label="Name" required />
      <Input name="slug" label="Slug" required placeholder="taco-factory" />
      <Input name="description" label="Description" />
      <Input name="street_address" label="Street address" />
      <div className="grid gap-3 sm:grid-cols-3">
        <Input name="city" label="City" />
        <Input name="state" label="State" />
        <Input name="zip" label="ZIP" />
      </div>
      <Input name="phone" label="Phone" />
      <Input name="email" label="Email" type="email" />
      <Button type="submit" loading={isPending}>
        Create restaurant
      </Button>
    </form>
  );
}
