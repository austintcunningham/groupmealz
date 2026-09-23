"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { assignOfficeUserByEmail } from "@/lib/actions/offices";
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
      const result = await assignOfficeUserByEmail(
        String(formData.get("office_id") ?? ""),
        email,
        formData.get("role") as "office_admin" | "employee"
      );
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSuccess(
        result.data.status === "invited"
          ? `${result.data.email} invited — they get this office role automatically when they sign up at /signup.`
          : `${result.data.email} assigned to office (account already existed).`
      );
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
        label="Work email"
        type="email"
        required
        placeholder="employee@company.com"
      />
      <Select name="role" label="Role">
        <option value="employee">Employee</option>
        <option value="office_admin">Office admin</option>
      </Select>
      <Button type="submit" variant="secondary" loading={isPending}>
        Assign or invite
      </Button>
      <p className="text-xs text-slate-500">
        No account needed first — enter their email, then they sign up at{" "}
        <span className="font-medium">/signup</span> with the same address.
      </p>
    </form>
  );
}
