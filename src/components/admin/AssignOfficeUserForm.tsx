"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { assignOfficeUser } from "@/lib/actions/offices";
import { findProfileIdByEmail } from "@/lib/actions/users";
import { Button, ErrorMessage, Input, Select, SuccessMessage } from "@/components/ui";
export function AssignOfficeUserForm({
  offices,
}: {
  offices: { id: string; name: string }[];
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

      const result = await assignOfficeUser(
        String(formData.get("office_id") ?? ""),
        lookup.data.id,
        formData.get("role") as "office_admin" | "employee"
      );
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSuccess(`${lookup.data.full_name || lookup.data.email} assigned to office`);
      router.refresh();
    });
  }

  if (!offices.length) return null;

  return (
    <form action={handleSubmit} className="mt-6 space-y-3 border-t pt-6">
      <h3 className="font-medium text-slate-900">Assign user to office</h3>
      {error ? <ErrorMessage message={error} /> : null}
      {success ? <SuccessMessage message={success} /> : null}
      <Select name="office_id" label="Office" required>
        {offices.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </Select>
      <Input
        name="email"
        label="User email"
        type="email"
        required
        placeholder="employee@company.com"
      />
      <Select name="role" label="Role">
        <option value="employee">Employee</option>
        <option value="office_admin">Office admin</option>
      </Select>
      <Button type="submit" variant="secondary" loading={isPending}>
        Assign user
      </Button>
      <p className="text-xs text-slate-500">
        User must have signed up first at /signup.
      </p>
    </form>
  );
}
