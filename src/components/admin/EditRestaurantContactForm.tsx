"use client";

import { useState, useTransition } from "react";
import { updateRestaurantContact } from "@/lib/actions/restaurants";
import { Button, ErrorMessage, Input, SuccessMessage } from "@/components/ui";

export function EditRestaurantContactForm({
  restaurantId,
  name,
  email,
  phone,
}: {
  restaurantId: string;
  name: string;
  email: string | null;
  phone: string | null;
}) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await updateRestaurantContact(restaurantId, {
        email: String(formData.get("email") ?? ""),
        phone: String(formData.get("phone") ?? "") || undefined,
      });
      if (!result.success) setError(result.error);
      else setSuccess("Contact updated");
    });
  }

  return (
    <form action={handleSubmit} className="mt-2 space-y-2 border-t border-slate-200 pt-3">
      <p className="text-xs font-medium text-slate-600">
        Kitchen / payout email for {name} (one address — not individual managers)
      </p>
      {error ? <ErrorMessage message={error} /> : null}
      {success ? <SuccessMessage message={success} /> : null}
      <Input
        name="email"
        label="Restaurant email"
        type="email"
        defaultValue={email ?? ""}
        placeholder="kitchen@partner.com"
        required
      />
      <Input name="phone" label="Phone" type="tel" defaultValue={phone ?? ""} />
      <Button type="submit" variant="secondary" loading={isPending} className="text-xs">
        Save contact
      </Button>
    </form>
  );
}
