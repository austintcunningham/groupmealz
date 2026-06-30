"use client";

import { useState, useTransition } from "react";
import { createOffice } from "@/lib/actions/offices";
import { ErrorMessage } from "@/components/ui";

export function CreateOfficeForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createOffice({
        name: String(formData.get("name") ?? ""),
        company_name: String(formData.get("company_name") ?? "") || undefined,
        street_address: String(formData.get("street_address") ?? ""),
        suite: String(formData.get("suite") ?? "") || undefined,
        city: String(formData.get("city") ?? "") || undefined,
        state: String(formData.get("state") ?? "") || undefined,
        zip: String(formData.get("zip") ?? "") || undefined,
        delivery_instructions:
          String(formData.get("delivery_instructions") ?? "") || undefined,
        contact_name: String(formData.get("contact_name") ?? "") || undefined,
        contact_phone: String(formData.get("contact_phone") ?? "") || undefined,
        contact_email: String(formData.get("contact_email") ?? "") || undefined,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      window.location.reload();
    });
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      {error ? <ErrorMessage message={error} /> : null}
      <Field name="name" label="Office name" required />
      <Field name="company_name" label="Company name" />
      <Field name="street_address" label="Street address" required />
      <Field name="suite" label="Suite" />
      <div className="grid gap-3 sm:grid-cols-3">
        <Field name="city" label="City" />
        <Field name="state" label="State" />
        <Field name="zip" label="ZIP" />
      </div>
      <Field name="delivery_instructions" label="Delivery instructions" />
      <Field name="contact_name" label="Contact name" />
      <Field name="contact_phone" label="Contact phone" />
      <Field name="contact_email" label="Contact email" type="email" />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? "Creating..." : "Create office"}
      </button>
    </form>
  );
}

function Field({
  name,
  label,
  required,
  type = "text",
}: {
  name: string;
  label: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
      />
    </div>
  );
}
