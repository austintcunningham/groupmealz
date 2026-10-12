"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  assignRestaurantManagerByEmail,
  resendRestaurantManagerInviteEmail,
} from "@/lib/actions/restaurants";
import { staffInviteSuccessMessage } from "@/lib/staff/invite-messages";
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
  const [lastEmail, setLastEmail] = useState<{ restaurantId: string; email: string } | null>(
    null
  );

  function submit(formData: FormData) {
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
      setSuccess(staffInviteSuccessMessage(result.data));
      setLastEmail({
        restaurantId: String(formData.get("restaurant_id") ?? ""),
        email,
      });
      router.refresh();
    });
  }

  function resendOnly() {
    if (!lastEmail) return;
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await resendRestaurantManagerInviteEmail(
        lastEmail.restaurantId,
        lastEmail.email
      );
      if (!result.success) {
        setError(result.error);
        return;
      }
      const d = result.data;
      const msg = d.emailSent
        ? `Invitation email queued again.${d.emailId ? ` Resend ID: ${d.emailId}.` : ""} Ask them to check spam.`
        : `Email was not sent (${d.emailError ?? "unknown error"}).`;
      setSuccess(msg);
    });
  }

  if (!restaurants.length) return null;

  return (
    <form
      className="mt-6 space-y-3 border-t pt-6"
      onSubmit={(e) => {
        e.preventDefault();
        submit(new FormData(e.currentTarget));
      }}
    >
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
      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="secondary" loading={isPending}>
          Assign or invite
        </Button>
        {lastEmail ? (
          <Button type="button" variant="ghost" size="sm" loading={isPending} onClick={resendOnly}>
            Resend email only
          </Button>
        ) : null}
      </div>
      <p className="text-xs text-slate-500">
        We email them a link to sign up (or sign in if they already have an account). They must use
        this exact email address.
      </p>
    </form>
  );
}
