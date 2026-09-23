"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { invitePlatformAdminByEmail } from "@/lib/actions/users";
import { Button, ErrorMessage, Input, SuccessMessage } from "@/components/ui";

export function InvitePlatformAdminForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(null);
    const email = String(formData.get("email") ?? "");

    startTransition(async () => {
      const result = await invitePlatformAdminByEmail(email);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSuccess(
        result.data.status === "invited"
          ? `${result.data.email} invited as platform admin — takes effect when they sign up.`
          : `${result.data.email} is now a platform admin.`
      );
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      {error ? <ErrorMessage message={error} /> : null}
      {success ? <SuccessMessage message={success} /> : null}
      <Input
        name="email"
        label="Admin email"
        type="email"
        required
        placeholder="you@groupmeals.net"
      />
      <Button type="submit" variant="secondary" loading={isPending}>
        Invite platform admin
      </Button>
      <p className="text-xs text-slate-500">
        Grants full <span className="font-medium">/admin</span> access after they register with this
        email. Existing accounts are promoted immediately.
      </p>
    </form>
  );
}
